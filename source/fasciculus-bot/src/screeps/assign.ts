
export class Assignees
{
    private static _assignees: Map<AssignableId, Set<CreepId>> = new Map();

    static assignees(assignable: AssignableId): Set<CreepId>
    {
        return Assignees._assignees.ensure(assignable, () => new Set());
    }

    static assign(assignable: AssignableId, creep: CreepId): void
    {
        Assignees.assignees(assignable).add(creep);
    }

    static unassign(assignable: AssignableId, creep: CreepId): void
    {
        Assignees.assignees(assignable).delete(creep);
    }

    static unassignAll(assignable: AssignableId): void
    {
        Assignees._assignees.delete(assignable);
    }

    static setup()
    {
        const assignees = Assignees._assignees;

        assignees.keep(Game.existing(assignees.ids));

        Assignees._assignees = assignees.map((k, v) => Game.existing(v));
    }
}