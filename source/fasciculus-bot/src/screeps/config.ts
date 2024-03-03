
export class ResourceConfig
{
    private _targets: Set<StructureConstant> = new Set();
    private _transporters: Set<string> = new Set();
    private _speed: number = 1;

    constructor()
    {
        this.reset();
    }

    private reset()
    {
        this._targets.clear();
        this._transporters.clear();
        this._speed = 1;
    }

    hasTarget(kind: StructureConstant): boolean
    {
        return this._targets.has(kind);
    }

    isTransporter(creep: Creep): boolean
    {
        return this._transporters.has(creep.kind);
    }

    get speed(): number
    {
        return this._speed;
    }

    setup(opts: Opt<ResourceOptions>)
    {
        this.reset();

        if (opts === undefined) return;

        if (opts.targets !== undefined) this._targets.addAll(opts.targets);
        if (opts.transporters !== undefined) this._transporters.addAll(opts.transporters);
        if (opts.speed !== undefined) this._speed = opts.speed;
    }
}

export class VisualConfig
{
    private _paths: boolean = false;
    private _resources: boolean = false;
    private _spawns: boolean = false;

    get paths(): boolean { return this._paths; }
    get resources(): boolean { return this._resources; }
    get spawns(): boolean { return this._spawns; }

    constructor()
    {
        this.reset();
    }

    private reset(): void
    {
        this._paths = false;
        this._resources = false;
        this._spawns = false;
    }

    setup(opts: Opt<VisualOptions>): void
    {
        this.reset();

        if (opts === undefined) return;

        this._paths = opts.paths === undefined ? false : opts.paths;
        this._resources = opts.resources === undefined ? false : opts.resources;
        this._spawns = opts.spawns === undefined ? false : opts.spawns;
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