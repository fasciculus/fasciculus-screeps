
export class Targets
{
    private static _targets: Map<CreepId, AssignableId> = new Map();

    static getTarget(creep: Creep): Opt<Assignable>
    {
        const id: Opt<AssignableId> = Targets._targets.get(creep.id);

        return id !== undefined ? Game.get(id) : undefined;
    }

    static setTarget(creep: Creep, newTarget: Opt<Assignable>): void
    {
        const creepId: CreepId = creep.id;
        const oldTarget: Opt<Assignable> = Targets.getTarget(creep);

        if (oldTarget !== undefined)
        {
            oldTarget.unassign(creepId);
        }

        if (newTarget !== undefined)
        {
            Targets._targets.set(creepId, newTarget.id);
            newTarget.assign(creepId);
        }
        else
        {
            Targets._targets.delete(creepId);
        }
    }

    static isIdle(creep: Creep): boolean
    {
        return !Targets._targets.has(creep.id);
    }

    static controller(target: Opt<Assignable>): Opt<StructureController>
    {
        if (target === undefined) return undefined;

        return target instanceof StructureController ? target : undefined;
    }

    static creep(target: Opt<Assignable>): Opt<Creep>
    {
        if (target === undefined) return undefined;

        return target instanceof Creep ? target : undefined;
    }

    static flag(target: Opt<Assignable>): Opt<Flag>
    {
        if (target === undefined) return undefined;

        return target instanceof Flag ? target : undefined;
    }

    static resource(target: Opt<Assignable>): Opt<Resource>
    {
        if (target === undefined) return undefined;

        return target instanceof Resource ? target : undefined;
    }

    static site(target: Opt<Assignable>): Opt<ConstructionSite>
    {
        if (target === undefined) return undefined;

        return target instanceof ConstructionSite ? target : undefined;
    }

    static source(target: Opt<Assignable>): Opt<Source>
    {
        if (target === undefined) return undefined;

        return target instanceof Source ? target : undefined;
    }

    static spawn(target: Opt<Assignable>): Opt<StructureSpawn>
    {
        if (target === undefined) return undefined;

        return target instanceof StructureSpawn ? target : undefined;
    }

    static setup()
    {
        const targets = Targets._targets;

        targets.keep(Game.existing(targets.ids));

        for (let entry of targets.entries())
        {
            const creep: Opt<Creep> = Game.get(entry[0]);
            const target: Opt<Assignable> = Game.get(entry[1]);

            if (creep === undefined) continue;

            if (target === undefined)
            {
                creep.target = undefined;
            }
        }
    }
}