
export class ResourceConfig
{
    private _targets: Set<StructureConstant> = new Set();

    constructor()
    {
        this.reset();
    }

    hasTarget(kind: StructureConstant): boolean
    {
        return this._targets.has(kind);
    }

    private reset()
    {
        this._targets.clear();
    }

    setup(opts: Opt<ResourceOptions>)
    {
        this.reset();

        if (opts === undefined) return;

        if (opts.targets !== undefined)
        {
            for (let target of opts.targets)
            {
                this._targets.add(target);
            }
        }
    }
}

export class VisualConfig
{
    private _paths: boolean = false;
    private _resources: boolean = false;

    get paths(): boolean { return this._paths; }
    get resources(): boolean { return this._resources; }

    constructor()
    {
        this.reset();
    }

    private reset(): void
    {
        this._paths = false;
        this._resources = false;
    }

    setup(opts: Opt<VisualOptions>): void
    {
        this.reset();

        if (opts === undefined) return;

        this._paths = opts.paths === undefined ? false : opts.paths;
        this._resources = opts.resources === undefined ? false : opts.resources;
    }
}

export class ScreepsConfig
{
    private static _resource: ResourceConfig = new ResourceConfig();
    private static _visual: VisualConfig = new VisualConfig();

    static get resource(): ResourceConfig { return ScreepsConfig._resource; }
    static get visual(): VisualConfig { return ScreepsConfig._visual; }

    static setup(opts: ScreepsOptions)
    {
        ScreepsConfig._resource.setup(opts.resource);
        ScreepsConfig._visual.setup(opts.visual);
    }
}