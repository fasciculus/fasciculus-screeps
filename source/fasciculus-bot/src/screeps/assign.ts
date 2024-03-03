
export class Assignees
{
    private static _assignees: Map<AssignableId, Set<CreepId>> = new Map();

    static assignedCount(assignableId: AssignableId): number
    {
        const ids: Opt<Set<CreepId>> = Assignees._assignees.get(assignableId);

        return ids === undefined ? 0 : ids.size;
    }

    static assignedCreeps(assignableId: AssignableId): Array<Creep>
    {
        const ids: Opt<Set<CreepId>> = Assignees._assignees.get(assignableId);

        if (ids === undefined) return new Array();

        return Game.all(ids);
    }

    private static assignees(assignableId: AssignableId): Set<CreepId>
    {
        return Assignees._assignees.ensure(assignableId, () => new Set());
    }

    static assign(assignableId: AssignableId, creep: CreepId): void
    {
        Assignees.assignees(assignableId).add(creep);
    }

    static unassign(assignableId: AssignableId, creep: CreepId): void
    {
        Assignees.assignees(assignableId).delete(creep);
    }

    static unassignAll(assignableId: AssignableId): void
    {
        Assignees._assignees.delete(assignableId);
    }

    static setup()
    {
        const assignees = Assignees._assignees;

        assignees.keep(Game.existing(assignees.ids));
    }
}