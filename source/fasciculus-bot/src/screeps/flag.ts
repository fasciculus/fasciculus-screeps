import { Objects } from "../es/object";
import { Assignees } from "./assign";
import { Cached } from "./cache";
import { Ids } from "./id";
import { Names } from "./name";

export class Flags
{
    private static _my: Cached<Map<FlagId, Flag>> = Cached.simple(Flags.fetchMy);
    private static _ofKind: Cached<Map<string, Array<Flag>>> = Cached.simple(Flags.fetchOfKind);

    private static fetchMy(): Map<FlagId, Flag>
    {
        return Objects.values(Game.flags).indexBy(f => f.id);
    }

    private static fetchOfKind(): Map<string, Array<Flag>>
    {
        return Flags._my.value.data.groupBy(f => f.kind);
    }

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

    private static my(): Array<Flag>
    {
        return Flags._my.value.data;
    }

    private static ofKind(kind: string): Array<Flag>
    {
        var result: Opt<Array<Flag>> = Flags._ofKind.value.get(kind);

        if (result === undefined) return new Array();

        return result;
    }

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

    private static _classProperties: any =
        {
            "my": Objects.getter(Flags.my),
            "ofKind": Objects.function(Flags.ofKind),
        }

    static setup()
    {
        Object.defineProperties(Flag.prototype, Flags._instanceProperties);
        Object.defineProperties(Flag, Flags._classProperties);
    }
}