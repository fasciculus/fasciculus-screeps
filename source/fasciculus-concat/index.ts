
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
    const cfg: Config = new Config();
    const tsc: TSConfig = new TSConfig();

    tsc.convert(cfg.main);
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