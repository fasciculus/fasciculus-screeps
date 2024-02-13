
import * as FS from "node:fs";
import * as Path from "node:path";
import * as TS from "typescript";

interface ConcatConfigJson
{
    main?: string;
}

interface PackageJson
{
    [key: string]: any;
    _concat?: ConcatConfigJson;
}

class ConcatConfig
{
    readonly main: string;

    constructor()
    {
        var main: string | undefined = undefined;

        if (FS.existsSync("concat.json"))
        {
            const json: string = FS.readFileSync("concat.json", { encoding: "utf-8" });
            const config: ConcatConfigJson = JSON.parse(json);

            main = config.main;
        }

        if (!main && FS.existsSync("package.json"))
        {
            const json: string = FS.readFileSync("package.json", { encoding: "utf-8" });
            const pkg: PackageJson = JSON.parse(json);
            const config: ConcatConfigJson | undefined = pkg._concat;

            if (config)
            {
                main = config.main;
            }
        }

        this.main = main || "index";
    }
}

interface ReadConfigFileResult
{
    config?: any;
    error?: TS.Diagnostic;
}

class TSConfig
{
    private readonly file: string;

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

    convert(main: string)
    {
        const content: ReadConfigFileResult = TS.readConfigFile(this.file, TS.sys.readFile);
        const config: any | undefined = content.config;

        if (!config) throw new Error("no config");

        const include: string = unixify(Path.join("concat", main));
        const options: TS.CompilerOptions = config["compilerOptions"];

        config["compileOnSave"] = false;
        config["include"] = [include];
        options.rootDir = "concat";

        const json: string = JSON.stringify(config, undefined, 2);

        FS.writeFileSync("tsconfig.concat.json", json);
    }
}

class Keys
{
    static createKey(root: string, file: string): string
    {
        var result: string = unixify(Path.relative(root, file));

        if (result.endsWith(".ts")) result = result.substring(0, result.length - 3);

        return result;
    }
}

class Source
{
    readonly file: string;
    readonly key: string;
    readonly source: TS.SourceFile;

    constructor(file: string, config: TSConfig)
    {
        this.file = file;
        this.key = Keys.createKey(config.rootDir, file);

        const program: TS.Program = TS.createProgram([file], config.parsedOptions);
        const source: TS.SourceFile | undefined = program.getSourceFile(file);

        if (!source) throw new Error("no source");

        this.source = source;
    }
}

class Sources
{
    readonly sources: Source[];

    constructor(files: string[], config: TSConfig)
    {
        this.sources = files.map(f => new Source(f, config));
    }

    keys(): Set<string>
    {
        return new Set(this.sources.map(s => s.key));
    }
}

try
{
    const start: number = Date.now();
    const cfg = new ConcatConfig();
    const tsc = new TSConfig();
    const sources = new Sources(tsc.fileNames, tsc);
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

    tsc.convert(cfg.main);

    const duration: number = Date.now() - start;

    console.log(`concatenation took ${(duration / 1000).toFixed(3)} seconds`);
}
catch(e)
{
    console.log(e)
    process.exitCode = -1;
}

function unixify(file: string): string
{
    return file.replaceAll("\\", "/");
}