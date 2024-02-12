
import * as FS from "node:fs";
import * as Path from "node:path";
import * as TS from "typescript";

interface ConfigJson
{
    main?: string;
}

class Config
{
    readonly main: string;

    constructor()
    {
        if (FS.existsSync("concat.json"))
        {
            const json: string = FS.readFileSync("concat.json", { encoding: "utf-8" });
            const config: ConfigJson = JSON.parse(json);

            this.main = config.main || "index";
        }
        else
        {
            this.main = "index";
        }
    }
}

class TSConfig
{
    private readonly file: string;

    readonly options: TS.CompilerOptions;
    readonly root: string;
    readonly files: string[];

    constructor()
    {
        const file: string | undefined = TS.findConfigFile("./", TS.sys.fileExists, "tsconfig.json");

        if (!file) throw new Error("no tsconfig.json");

        this.file = file;

        const content = TS.readConfigFile(file, TS.sys.readFile);
        const config: any | undefined = content.config;
        const options: any = config["compilerOptions"];

        if (!config) throw new Error("no config");
        if (!options["rootDir"]) throw new Error("no rootDir in tsconfig.json");

        var root: string = unixify(options["rootDir"]);

        if (root.startsWith("./")) root = root.substring(2);
        if (root.endsWith("/")) root = root.substring(0, root.length - 1);

        this.root = root;

        const parsed: TS.ParsedCommandLine = TS.parseJsonConfigFileContent(content, TS.sys, "./");

        this.options = parsed.options;
        this.files = parsed.fileNames;
    }

    convert(main: string)
    {
        const content = TS.readConfigFile(this.file, TS.sys.readFile);
        const config: any | undefined = content.config;

        if (!config) throw new Error("no config");

        const include = unixify(Path.join("concat", main));
        const options = config["compilerOptions"];

        config["compileOnSave"] = false;
        config["include"] = [include];
        options["rootDir"] = "concat";

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
        this.key = Keys.createKey(config.root, file);

        const program: TS.Program = TS.createProgram([file], config.options);
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
}

try
{
    const cfg: Config = new Config();
    const tsc: TSConfig = new TSConfig();
    const sources: Sources = new Sources(tsc.files, tsc);

    for (let source of sources.sources)
    {
        console.log(`${source.file} (${source.key})`);

        TS.forEachChild(source.source, node =>
        {
            if (TS.isImportDeclaration(node))
            {
                console.log(node.moduleSpecifier)
            }
        });
    }

    tsc.convert(cfg.main);
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