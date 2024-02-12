
import * as FS from "node:fs";
import * as Path from "node:path";
import * as TS from "typescript";

interface PackageJson
{
    [key: string]: any,
    main?: string
}

class PackageConfig
{
    readonly main: string;

    constructor()
    {
        const json = FS.readFileSync("package.json", { encoding: "utf-8" });
        const pkg: PackageJson = JSON.parse(json);

        if (!pkg.main) throw new Error(`no "main" in package.json`)

        this.main = pkg.main;
    }
}

class TSConfig
{
    readonly file: string;
    readonly parsed: TS.ParsedCommandLine;

    readonly files: string[];

    constructor()
    {
        const file: string | undefined = TS.findConfigFile("./", TS.sys.fileExists, "tsconfig.json");

        if (!file) throw new Error("no tsconfig.json");

        const content = TS.readConfigFile(file, TS.sys.readFile);

        this.file = file;
        this.parsed = TS.parseJsonConfigFileContent(content, TS.sys, "./");
        this.files = this.parsed.fileNames;
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

try
{
    const pkg: PackageConfig = new PackageConfig();
    const tsconfig: TSConfig = new TSConfig();

    tsconfig.convert("index.ts");
}
catch(e)
{
    console.log(e)
    process.exit(-1);
}

process.exit(0);

function unixify(file: string): string
{
    return file.replaceAll("\\", "/");
}