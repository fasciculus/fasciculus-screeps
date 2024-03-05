
export class TransportGoalsConfig
{
    private _spawns: boolean = false;

    private reset()
    {
        this._spawns = false;
    }

    get spawns(): boolean { return this._spawns; }

    setup(opts: Opt<TransportGoalOptions>)
    {
        this.reset();

        if (opts === undefined) return;

        if (opts.spawns !== undefined) this._spawns = opts.spawns;
    }
}

export class TransportConfig
{
    private _speed: number = 1;
    private _transporters: Set<string> = new Set();

    private _goals: TransportGoalsConfig = new TransportGoalsConfig();

    constructor()
    {
        this.reset();
    }

    private reset()
    {
        this._speed = 1;
        this._transporters.clear();
    }

    get speed(): number { return this._speed; }
    isTransporter(creep: Creep): boolean { return this._transporters.has(creep.kind); }

    get goals(): TransportGoalsConfig { return this._goals; }

    setup(opts: Opt<TransportOptions>)
    {
        this.reset();

        if (opts === undefined) return;

        if (opts.speed !== undefined) this._speed = opts.speed;
        if (opts.transporters !== undefined) this._transporters.addAll(opts.transporters);

        this._goals.setup(opts.goals);
    }
}

export class VisualConfig
{
    private _controllers: boolean = false;
    private _paths: boolean = false;
    private _resources: boolean = false;
    private _sources: boolean = false;
    private _spawns: boolean = false;

    get controllers(): boolean { return this._controllers; }
    get paths(): boolean { return this._paths; }
    get resources(): boolean { return this._resources; }
    get sources(): boolean { return this._sources; }
    get spawns(): boolean { return this._spawns; }

    constructor()
    {
        this.reset();
    }

    private reset(): void
    {
        this._controllers = false;
        this._paths = false;
        this._resources = false;
        this._sources = false;
        this._spawns = false;
    }

    setup(opts: Opt<VisualOptions>): void
    {
        this.reset();

        if (opts === undefined) return;

        if (opts.controllers !== undefined) this._controllers = opts.controllers;
        if (opts.paths !== undefined) this._paths = opts.paths;
        if (opts.resources !== undefined) this._resources = opts.resources;
        if (opts.sources !== undefined) this._sources = opts.sources;
        if (opts.spawns !== undefined) this._spawns = opts.spawns;
    }
}

export class ScreepsConfig
{
    private static _transport: TransportConfig = new TransportConfig();
    private static _visual: VisualConfig = new VisualConfig();

    static get transport(): TransportConfig { return ScreepsConfig._transport; }
    static get visual(): VisualConfig { return ScreepsConfig._visual; }

    static setup(opts: ScreepsOptions)
    {
        ScreepsConfig._transport.setup(opts.transport);
        ScreepsConfig._visual.setup(opts.visual);
    }
}