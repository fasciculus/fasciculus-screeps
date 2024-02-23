
export class Targets
{
    private static _targets: Map<CreepId, AssignableId> = new Map();

    static hasTarget(creep: Creep): boolean
    {
        return Targets._targets.has(creep.id);
    }

    static getTarget(creep: Creep): Opt<Assignable>
    {
        const id: Opt<AssignableId> = Targets._targets.get(creep.id);

        return id ? Game.get(id) : undefined;
    }

    static setTarget(creep: Creep, newTarget: Opt<Assignable>): void
    {
        const creepId: CreepId = creep.id;
        const oldTarget: Opt<Assignable> = Targets.getTarget(creep);

        if (oldTarget)
        {
            oldTarget.unassign(creepId);
        }

        if (newTarget)
        {
            Targets._targets.set(creepId, newTarget.id);
            newTarget.assign(creepId);
        }
        else
        {
            Targets._targets.delete(creepId);
        }
    }

    static creep(target: Opt<Assignable>): Opt<Creep>
    {
        return target && target instanceof Creep ? target : undefined;
    }

    static resource(target: Opt<Assignable>): Opt<Resource>
    {
        return target && target instanceof Resource ? target : undefined;
    }

    static source(target: Opt<Assignable>): Opt<Source>
    {
        return target && target instanceof Source ? target : undefined;
    }

    static spawn(target: Opt<Assignable>): Opt<StructureSpawn>
    {
        return target && target instanceof StructureSpawn ? target : undefined;
    }

    static cleanup()
    {
        const targets = Targets._targets;

        targets.keep(Game.existing(targets.ids));
    }
}