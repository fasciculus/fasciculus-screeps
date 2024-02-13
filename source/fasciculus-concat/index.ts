
import * as FS from "node:fs";
import * as Path from "node:path";
import * as TS from "typescript";

function unixify(file: string): string
{
    return file.replaceAll("\\", "/");
}

function getKey(root: string, file: string): string
{
    var result: string = unixify(Path.relative(root, file));

    if (result.startsWith("./")) result = result.substring(2);
    if (result.endsWith(".ts")) result = result.substring(0, result.length - 3);

    return result;
}

interface ConcatConfigJson
{
    main?: string;
    concatDir?: string;
}

interface PackageJson
{
    [key: string]: any;
    _concat?: ConcatConfigJson;
}

interface ReadConfigFileResult
{
    config?: any;
    error?: TS.Diagnostic;
}

class TSConfig
{
    readonly file: string;
    readonly rootDir: string;
    readonly parsedOptions: TS.CompilerOptions;
    readonly fileNames: string[];

    constructor()
    {
        const file: string | undefined = TS.findConfigFile("./", TS.sys.fileExists, "tsconfig.json");

        if (!file) throw new Error("no tsconfig.json");

        this.file = file;

        const content: ReadConfigFileResult = TS.readConfigFile(file, TS.sys.readFile);
        const config: any | undefined = content.config;
        const options: TS.CompilerOptions = config["compilerOptions"];

        if (!config) throw new Error("no config");
        if (!options.rootDir) throw new Error("no rootDir in tsconfig.json");

        var rootDir: string = unixify(options.rootDir);

        if (rootDir.startsWith("./")) rootDir = rootDir.substring(2);
        if (rootDir.endsWith("/")) rootDir = rootDir.substring(0, rootDir.length - 1);

        this.rootDir = rootDir;

        const parsed: TS.ParsedCommandLine = TS.parseJsonConfigFileContent(content, TS.sys, "./");

        this.parsedOptions = parsed.options;
        this.fileNames = parsed.fileNames;
    }
}

class ConcatContext
{
    readonly tscFile: string;

    readonly mainFile: string;
    readonly mainKey: string;
    readonly concatDir: string;

    readonly rootDir: string;
    readonly options: TS.CompilerOptions;
    readonly fileNames: string[];

    constructor()
    {
        const tsc = new TSConfig();

        this.tscFile = tsc.file;

        var mainFile: string | undefined = undefined;
        var concatDir: string | undefined = undefined;

        if (FS.existsSync("concat.json"))
        {
            const json: string = FS.readFileSync("concat.json", { encoding: "utf-8" });
            const config: ConcatConfigJson = JSON.parse(json);

            mainFile = config.main;
            concatDir = config.concatDir;
        }

        if ((!mainFile || !concatDir) && FS.existsSync("package.json"))
        {
            const json: string = FS.readFileSync("package.json", { encoding: "utf-8" });
            const pkg: PackageJson = JSON.parse(json);
            const config: ConcatConfigJson | undefined = pkg._concat;

            if (config)
            {
                if (!mainFile) mainFile = config.main;
                if (!concatDir) concatDir = concatDir;
            }
        }

        this.mainFile = mainFile || "index";
        this.mainKey = getKey(tsc.rootDir, this.mainFile);
        this.concatDir = concatDir || "concat";

        this.rootDir = tsc.rootDir;
        this.options = tsc.parsedOptions;
        this.fileNames = tsc.fileNames;
    }
}

class Source
{
    readonly file: string;
    readonly key: string;
    readonly tsSource: TS.SourceFile;

    constructor(file: string, ctx: ConcatContext)
    {
        this.file = file;
        this.key = getKey(ctx.rootDir, file);

        const program: TS.Program = TS.createProgram([file], ctx.options);
        const tsSource: TS.SourceFile | undefined = program.getSourceFile(file);

        if (!tsSource) throw new Error("no source");

        this.tsSource = tsSource;
    }
}

class Sources
{
    private readonly sources: Source[];
    private readonly sourceMap: Map<string, Source> = new Map();

    constructor(ctx: ConcatContext)
    {
        this.sources = ctx.fileNames.map(f => new Source(f, ctx));
        this.sources.forEach(s => this.sourceMap.set(s.key, s));
    }

    keys(): Set<string>
    {
        return new Set(this.sourceMap.keys());
    }

    forEach(fn: (source: Source) => void): void
    {
        this.sources.forEach(fn);
    }

    get(keys: Array<string>): Array<Source>
    {
        const result: Array<Source> = new Array();

        for (let key of keys)
        {
            const source: Source | undefined = this.sourceMap.get(key);

            if (source) result.push(source);
        }

        return result;
    }
}

class Analyzer
{
    static importKey(key: string, tsSource: TS.SourceFile, decl: TS.ImportDeclaration): string
    {
        const specifier: string = decl.moduleSpecifier.getText(tsSource);
        const trimmed: string = specifier.substring(1, specifier.length - 1);
        const combined: string = unixify(Path.join(key, "..", trimmed));

        return getKey("", combined);
    }
}

class Dependencies
{
    private readonly sources: Sources;
    private readonly keys: Set<string>;
    private readonly unresolved: Map<string, Set<string>> = new Map();
    private readonly resolved: Array<string> = new Array();

    constructor(sources: Sources)
    {
        this.sources = sources;
        this.keys = sources.keys();
        sources.forEach(source => this.addDependencies(source));
    }

    private addDependencies(source: Source): void
    {
        const tsSource: TS.SourceFile = source.tsSource;
        const dependencies: Set<string> = new Set();

        TS.forEachChild(tsSource, (node) =>
        {
            if (TS.isImportDeclaration(node))
            {
                const key = Analyzer.importKey(source.key, tsSource, node);

                if (this.keys.has(key))
                {
                    dependencies.add(key);
                }
            }
        });

        this.unresolved.set(source.key, dependencies);
    }

    resolve(): Source[]
    {
        var iteration: number = 0;
        const unresolved: Map<string, Set<string>> = this.unresolved;

        while (iteration < 100 && unresolved.size > 0)
        {
            const resolved: Set<string> = new Set(); 

            for (let entry of unresolved.entries())
            {
                if (entry[1].size == 0) resolved.add(entry[0]);
            }

            resolved.forEach(r => {
                unresolved.delete(r);
                this.resolved.push(r);
            });

            for (let dependencies of unresolved.values())
            {
                resolved.forEach(r => dependencies.delete(r));
            }

            ++iteration;
        }

        if (iteration >= 100) throw new Error("circular dependencies");

        return this.sources.get(this.resolved);
    }
}

class Transpiler
{
    static tsc(ctx: ConcatContext): string
    {
        const content: ReadConfigFileResult = TS.readConfigFile(ctx.tscFile, TS.sys.readFile);
        const config: any | undefined = content.config;

        if (!config) throw new Error("no config");

        const include: string = unixify(Path.join(ctx.concatDir, ctx.mainFile));
        const options: TS.CompilerOptions = config["compilerOptions"];

        config["compileOnSave"] = false;
        config["include"] = [include];
        options.rootDir = ctx.concatDir;

        return JSON.stringify(config, undefined, 2);
    }
}

try
{
    const start: number = Date.now();
    const ctx = new ConcatContext();
    const sources = new Sources(ctx);
    const dependencies = new Dependencies(sources);
    const sorted: Array<Source> = dependencies.resolve();
    const tsc: string = Transpiler.tsc(ctx);

    console.log(sorted.map(s => s.key));

    FS.writeFileSync("tsconfig.concat.json", tsc);

    const duration: number = Date.now() - start;

    console.log(`concatenation took ${(duration / 1000).toFixed(3)} seconds`);
}
catch(e)
{
    console.log(e)
    process.exitCode = -1;
}
