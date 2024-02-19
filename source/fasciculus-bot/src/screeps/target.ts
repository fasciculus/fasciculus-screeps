
export class Targets
{
    private static _targets: Map<CreepId, AssignableId> = new Map();

    static getTarget(creep: Creep): Assignable | undefined
    {
        const id: AssignableId | undefined = Targets._targets.get(creep.id);

        return id ? Game.get(id) : undefined;
    }

    static setTarget(creep: Creep, newTarget: Assignable | undefined): void
    {
        const creepId: CreepId = creep.id;
        const oldTarget: Assignable | undefined = Targets.getTarget(creep);

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

    static cleanup()
    {
        const targets = Targets._targets;

        targets.keep(Game.existing(targets.ids));
    }
}