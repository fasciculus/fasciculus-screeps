
export class Assignees
{
    private static _assigns: Map<AssignableId, Set<CreepId>> = new Map();

    static assignees(assignable: AssignableId): Set<CreepId>
    {
        return Assignees._assigns.ensure(assignable, () => new Set());
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
        Assignees._assigns.delete(assignable);
    }
}