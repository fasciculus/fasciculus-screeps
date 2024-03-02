
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

export class ScreepsConfig
{
    private static _resource: ResourceConfig = new ResourceConfig();

    static get resource(): ResourceConfig { return ScreepsConfig._resource; }

    static setup(opts: ScreepsOptions)
    {
        ScreepsConfig._resource.setup(opts.resource);
    }
}