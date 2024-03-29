
import * as FS from "node:fs";
import * as Path from "node:path";
import * as TS from "typescript";

const VERSION = "0.2.102";

function unixify(file: string): string
{
    return file.replaceAll("\\", "/");
}

function fixDirectory(dir: string): string
{
    dir = unixify(dir);

    if (dir.startsWith("./")) dir = dir.substring(2);
    if (dir.endsWith("/")) dir = dir.substring(0, dir.length - 1);

    return dir;
}

function getKey(file: string, root: string): string
{
    var result: string = unixify(Path.relative(root, file));

    if (result.startsWith("./")) result = result.substring(2);
    if (result.endsWith(".ts")) result = result.substring(0, result.length - 3);

    return result;
}

function getSourceFileKey(sourceFile: TS.SourceFile, cwd: string, root: string): string
{
    var file: string = sourceFile.fileName;

    if (Path.isAbsolute(file))
    {
        file = Path.relative(cwd, file);
    }

    return getKey(file, root);
}

function newLine(newLine: TS.NewLineKind)
{
    switch (newLine)
    {
        case TS.NewLineKind.CarriageReturnLineFeed: return "\r\n";
        case TS.NewLineKind.LineFeed: return "\n";
        default: return "\r\n";
    }
}

interface ConcatConfigJson
{
    main?: string;
    types?: Array<string>;
    concatDir?: string;
    outDir?: string;
    removeExports?: boolean;
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
    readonly outDir: string;
    readonly newLine: TS.NewLineKind;
    readonly parsedOptions: TS.CompilerOptions;
    readonly fileNames: Array<string>;

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
        if (!options.outDir) throw new Error("no outDir in tsconfig.json");

        this.rootDir = fixDirectory(options.rootDir);
        this.outDir = fixDirectory(options.rootDir);

        this.newLine = options.newLine || TS.NewLineKind.CarriageReturnLineFeed;

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
    readonly types: Array<string>;
    readonly concatDir: string;
    readonly outDir: string;
    readonly removeExports: boolean;

    readonly rootDir: string;
    readonly options: TS.CompilerOptions;
    readonly newLine: TS.NewLineKind;
    readonly fileNames: Array<string>;

    readonly tsHost: TS.CompilerHost;

    constructor()
    {
        const tsc = new TSConfig();
        const concatConfig: ConcatConfigJson | undefined = ConcatContext.getConcatConfig();

        this.tscFile = tsc.file;

        this.mainFile = concatConfig?.main || "index";
        this.mainKey = getKey(this.mainFile, "");
        this.types = concatConfig?.types || new Array();
        this.concatDir = concatConfig?.concatDir || "concat";
        this.outDir = concatConfig?.outDir || tsc.outDir;
        this.removeExports = concatConfig?.removeExports || false;

        this.rootDir = tsc.rootDir;
        this.options = tsc.parsedOptions;
        this.newLine = tsc.newLine;
        this.fileNames = tsc.fileNames;

        this.tsHost = TS.createCompilerHost(this.options);
    }

    private static getConcatConfig(): ConcatConfigJson | undefined
    {
        var result: ConcatConfigJson | undefined = undefined;

        if (FS.existsSync("concat.json"))
        {
            result = JSON.parse(FS.readFileSync("concat.json", { encoding: "utf-8" }));
        }
        else if (FS.existsSync("package.json"))
        {
            const json: string = FS.readFileSync("package.json", { encoding: "utf-8" });
            const pkg: PackageJson = JSON.parse(json);

            result = pkg._concat;
        }

        return result;
    }
}

interface SourceEntry
{
    key: string;
    sourceFile: TS.SourceFile;
}

class Sources
{
    private readonly map: Map<string, TS.SourceFile> = new Map();

    constructor(ctx: ConcatContext)
    {
        const program: TS.Program = Sources.createProgram(ctx);
        const cwd: string = program.getCurrentDirectory();
        const root: string = ctx.rootDir;

        for (let sourceFile of program.getSourceFiles())
        {
            if (program.isSourceFileDefaultLibrary(sourceFile)) continue;
            if (program.isSourceFileFromExternalLibrary(sourceFile)) continue;

            const key: string = getSourceFileKey(sourceFile, cwd, root);

            if (key.startsWith("../")) continue;

            this.map.set(key, sourceFile);
        }
    }

    has(key: string): boolean
    {
        return this.map.has(key);
    }

    keys(): Set<string>
    {
        return new Set(this.map.keys());
    }

    get(key: string): TS.SourceFile
    {
        const sourceFile: TS.SourceFile | undefined = this.map.get(key);

        if (!sourceFile) throw new Error(`invalid program state '${key}'`);

        return sourceFile;
    }

    all(keys: Array<string>): Array<SourceEntry>
    {
        const result: Array<SourceEntry> = new Array();

        for (let key of keys)
        {
            const sourceFile: TS.SourceFile | undefined = this.map.get(key);

            if (sourceFile) result.push({ key, sourceFile });
        }

        return result;
    }

    private static createProgram(ctx: ConcatContext): TS.Program
    {
        const files: Array<string> = Sources.getFiles(ctx);

        return TS.createProgram(files, ctx.options, ctx.tsHost);
    }

    private static getFiles(ctx: ConcatContext): Array<string>
    {
        return ctx.fileNames.filter(f => Sources.isIncluded(f, ctx));
    }

    private static isIncluded(file: string, ctx: ConcatContext)
    {
        return !getKey(file, ctx.rootDir).startsWith("../");
    }
}

class Analyzer
{
    static importKey(key: string, tsSource: TS.SourceFile, decl: TS.ImportDeclaration): string
    {
        const specifier: string = decl.moduleSpecifier.getText(tsSource);
        const trimmed: string = specifier.substring(1, specifier.length - 1);
        const combined: string = unixify(Path.join(key, "..", trimmed));

        return getKey(combined, "");
    }

    private static hasExport(modifiers: TS.NodeArray<TS.ModifierLike> | undefined): boolean
    {
        if (!modifiers) return false;

        return modifiers.findIndex(v => v.kind == TS.SyntaxKind.ExportKeyword) >= 0;
    }

    static isExport(node: TS.Node): boolean
    {
        if (node.kind == TS.SyntaxKind.EndOfFileToken) return false;
        if (node.kind == TS.SyntaxKind.ExpressionStatement) return false;

        if (TS.isVariableStatement(node)) return Analyzer.hasExport(node.modifiers);
        if (TS.isClassDeclaration(node)) return Analyzer.hasExport(node.modifiers);
        if (TS.isInterfaceDeclaration(node)) return Analyzer.hasExport(node.modifiers);
        if (TS.isTypeAliasDeclaration(node)) return Analyzer.hasExport(node.modifiers);

        console.log(`unhandled: ${node.kind}`);

        return false;
    }
}

class Tree
{
    private _children: Map<string, Set<string>> = new Map();
    private _root?: string;

    constructor(root: string)
    {
        this._children.set(root, new Set());
        this._root = root;
    }

    get size(): number
    {
        return this._root ? this._children.size : 0;
    }

    insert(parent: string, child: string)
    {
        const children: Set<string> | undefined = this._children.get(parent);

        if (!children) throw new Error("invalid insert");

        children.add(child);

        if (!this._children.has(child))
        {
            this._children.set(child, new Set());
        }
    }

    delete(node: string)
    {
        if (node == this._root)
        {
            this._root = undefined;
            this._children.clear();
            return;
        }

        for (let children of this._children.values())
        {
            children.delete(node);
        }
    }

    next(): string
    {
        if (!this._root) throw new Error("tree empty");

        var current: string = this._root;
        var children: Set<string> | undefined = this._children.get(current);
        var iteration: number = 0;
        var maxIterations: number = this._children.size + 2;

        while (iteration < maxIterations)
        {
            if (!children) throw new Error("invalid tree");
            if (children.size == 0) return current;

            current = Array.from(children)[0];
            children = this._children.get(current);
            ++iteration;
        }

        throw new Error("cyclic tree");
    }
}

class Dependencies
{
    private readonly sources: Sources;
    private readonly tree: Tree;
    private readonly resolved: Array<string> = new Array();

    constructor(sources: Sources, ctx: ConcatContext)
    {
        this.sources = sources;
        this.tree = Dependencies.createTree(sources, ctx.mainKey);
    }

    resolve(): Array<SourceEntry>
    {
        const tree: Tree = this.tree;
        const resolved = this.resolved;

        while (tree.size > 0)
        {
            const next: string = tree.next();

            resolved.push(next);
            tree.delete(next);
        }

        return this.sources.all(resolved);
    }

    private static createTree(sources: Sources, main: string): Tree
    {
        const tree: Tree = new Tree(main);
        const todo: Array<string> = Array.from([main]);
        const done: Set<string> = new Set();

        while (todo.length > 0)
        {
            const parent: string = todo.pop()!;

            if (done.has(parent)) continue;

            const source: TS.SourceFile = sources.get(parent);

            TS.forEachChild(source, (node) =>
            {
                if (TS.isImportDeclaration(node))
                {
                    const child = Analyzer.importKey(parent, source, node);

                    if (sources.has(child))
                    {
                        tree.insert(parent, child);
                        todo.push(child);
                    }
                }
            });

            done.add(parent);
        }

        return tree;
    }
}

class Transpiler
{
    static tsc(ctx: ConcatContext): string
    {
        const content: ReadConfigFileResult = TS.readConfigFile(ctx.tscFile, TS.sys.readFile);
        const config: any | undefined = content.config;

        if (!config) throw new Error("no config");

        const includes: Array<string> = Transpiler.includes(ctx);
        const options: TS.CompilerOptions = config["compilerOptions"];

        config["compileOnSave"] = false;
        config["include"] = includes;
        options.rootDir = ctx.concatDir;
        options.outDir = ctx.outDir;

        return JSON.stringify(config, undefined, 2);
    }

    private static includes(ctx: ConcatContext): Array<string>
    {
        const result: Array<string> = new Array();

        result.push(unixify(Path.join(ctx.concatDir, ctx.mainFile)));

        for (let file of ctx.types)
        {
            result.push(unixify(Path.join(ctx.concatDir, file)));
        }

        return result;
    }

    static sources(files: Array<SourceEntry>, keys: Set<string>, ctx: ConcatContext): string
    {
        return files.map(f => Transpiler.source(f, keys, ctx)).join(newLine(ctx.newLine));
    }

    private static source(entry: SourceEntry, keys: Set<string>, ctx: ConcatContext): string
    {
        const result: Array<string> = new Array();
        const sourceFile: TS.SourceFile = entry.sourceFile;

        TS.forEachChild(sourceFile, node =>
        {
            if (TS.isImportDeclaration(node))
            {
                if (keys.has(Analyzer.importKey(entry.key, sourceFile, node))) return;
            }

            var text = node.getText(sourceFile);

            if (entry.key != ctx.mainKey)
            {
                if (ctx.removeExports && Analyzer.isExport(node))
                {
                    text = text.trimStart().substring(6).trimStart();
                }
            }

            result.push(text);
        });

        return result.join(newLine(ctx.newLine));
    }
}

try
{
    console.log(`faciculus-concat ${VERSION}.`);

    const start: number = Date.now();
    const ctx = new ConcatContext();
    const sources: Sources = new Sources(ctx);
    const dependencies = new Dependencies(sources, ctx);
    const sorted: Array<SourceEntry> = dependencies.resolve();

    const ts: string = Transpiler.sources(sorted, sources.keys(), ctx);
    const tsFile: string = unixify(Path.join(ctx.concatDir, ctx.mainFile));

    FS.mkdirSync(ctx.concatDir, { recursive: true });
    FS.writeFileSync(tsFile, ts, { encoding: "utf-8", flush: true });

    for (let file of ctx.types)
    {
        const src = Path.join(ctx.rootDir, file);
        const dst = Path.join(ctx.concatDir, file);
        const dir = Path.dirname(dst);

        FS.mkdirSync(dir, { recursive: true });
        FS.copyFileSync(src, dst);
    }

    const tsc: string = Transpiler.tsc(ctx);

    FS.writeFileSync("tsconfig.concat.json", tsc);

    const duration: number = Date.now() - start;

    console.log(`concatenation took ${(duration / 1000).toFixed(3)} seconds.`);
}
catch(e)
{
    console.log(e)
    process.exitCode = -1;
}
