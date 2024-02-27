import { Objects } from "../es/object";
import { Assignees } from "./assign";
import { Ids } from "./id";
import { Names } from "./name";

export class Flags
{
    private static id(this: Flag): FlagId
    {
        return Ids.flagId(this);
    }

    private static kind(this: Flag): string
    {
        return Names.kind(this.name);
    }

    private static assignees(this: Flag): Set<CreepId> { return Assignees.assignees(this.id); }
    private static assignedCreeps(this: Flag): Array<Creep> { return Game.all(this.assignees); }
    private static assign(this: Flag, creep: CreepId): void { Assignees.assign(this.id, creep); }
    private static unassign(this: Flag, creep: CreepId): void { Assignees.unassign(this.id, creep); }
    private static unassignAll(this: Flag): void { Assignees.unassignAll(this.id); }

    private static _instanceProperties: any =
        {
            "id": Objects.getter(Flags.id),
            "kind": Objects.getter(Flags.kind),
            "assignees": Objects.getter(Flags.assignees),
            "assignedCreeps": Objects.getter(Flags.assignedCreeps),
            "assign": Objects.function(Flags.assign),
            "unassign": Objects.function(Flags.unassign),
            "unassignAll": Objects.function(Flags.unassignAll),
        };

    static setup()
    {
        Object.defineProperties(Flag.prototype, Flags._instanceProperties);
    }
}