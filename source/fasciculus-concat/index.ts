
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

    if (result.endsWith(".ts")) result = result.substring(0, result.length - 3);

    return result;
}

interface ConcatConfigJson
{
    main?: string;
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

    readonly rootDir: string;
    readonly options: TS.CompilerOptions;
    readonly fileNames: string[];

    readonly concatDir: string;

    constructor()
    {
        const tsc = new TSConfig();

        this.tscFile = tsc.file;

        var mainFile: string | undefined = undefined;

        if (FS.existsSync("concat.json"))
        {
            const json: string = FS.readFileSync("concat.json", { encoding: "utf-8" });
            const config: ConcatConfigJson = JSON.parse(json);

            mainFile = config.main;
        }

        if (!mainFile && FS.existsSync("package.json"))
        {
            const json: string = FS.readFileSync("package.json", { encoding: "utf-8" });
            const pkg: PackageJson = JSON.parse(json);
            const config: ConcatConfigJson | undefined = pkg._concat;

            if (config)
            {
                mainFile = config.main;
            }
        }

        this.mainFile = mainFile || "index";
        this.mainKey = getKey(tsc.rootDir, this.mainFile);

        this.rootDir = tsc.rootDir;
        this.options = tsc.parsedOptions;
        this.fileNames = tsc.fileNames;

        this.concatDir = "concat";
    }
}

class Source
{
    readonly file: string;
    readonly key: string;
    readonly source: TS.SourceFile;

    constructor(file: string, ctx: ConcatContext)
    {
        this.file = file;
        this.key = getKey(ctx.rootDir, file);

        const program: TS.Program = TS.createProgram([file], ctx.options);
        const source: TS.SourceFile | undefined = program.getSourceFile(file);

        if (!source) throw new Error("no source");

        this.source = source;
    }
}

class Sources
{
    readonly sources: Source[];

    constructor(ctx: ConcatContext)
    {
        this.sources = ctx.fileNames.map(f => new Source(f, ctx));
    }

    keys(): Set<string>
    {
        return new Set(this.sources.map(s => s.key));
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
    const keys = sources.keys();

    //for (let source of sources.sources)
    //{
    //    console.log(`${source.file} (${source.key})`);

    //    TS.forEachChild(source.source, node =>
    //    {
    //        if (TS.isImportDeclaration(node))
    //        {
    //            console.log(node.moduleSpecifier)
    //        }
    //    });
    //}

    const tsc: string = Transpiler.tsc(ctx);

    FS.writeFileSync("tsconfig.concat.json", tsc);

    const duration: number = Date.now() - start;

    console.log(`concatenation took ${(duration / 1000).toFixed(3)} seconds`);
}
catch(e)
{
    console.log(e)
    process.exitCode = -1;
}
