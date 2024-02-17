import { Objects } from "../es/object";
import { Assignees } from "./assign";
import { Cached } from "./cache";

export class Sources
{
    private static _known: Cached<Map<SourceId, Source>> = Cached.simple(Sources.fetchKnown);
    private static _safe: Cached<Map<SourceId, Source>> = Cached.simple(Sources.fetchSafe);

    private static _slots: Map<SourceId, number> = new Map();

    private static fetchKnown(): Map<SourceId, Source>
    {
        return Array.flatten(Room.known.map(r => r.sources)).indexBy(s => s.id);
    }

    private static isSafe(id: SourceId, source: Source)
    {
        return source.room.safe;
    }

    private static fetchSafe(): Map<SourceId, Source>
    {
        return Sources._known.value.filter(Sources.isSafe);
    }

    private static getSlots(id: SourceId, source: Source | undefined): number
    {
        return source ? source.room.terrain.walkableAround(source.pos, 1) : 0;
    }

    private static slots(this: Source)
    {
        return Sources._slots.ensure(this.id, Sources.getSlots, this);
    }

    private static freeSlots(this: Source): number
    {
        return this.slots - this.assignees.size;
    }

    private static assignees(this: Source): Set<CreepId> { return Assignees.assignees(this.id); }
    private static assignedCreeps(this: Source): Array<Creep> { return Game.all(this.assignees); }
    private static assign(this: Source, creep: CreepId): void { Assignees.assign(this.id, creep); }
    private static unassign(this: Source, creep: CreepId): void { Assignees.unassign(this.id, creep); }
    private static unassignAll(this: Source): void { Assignees.unassignAll(this.id); }

    private static safe()
    {
        return Sources._safe.value.data;
    }

    private static _instanceProperties: any =
        {
            "slots": Objects.getter(Sources.slots),
            "freeSlots": Objects.getter(Sources.freeSlots),
            "assignees": Objects.getter(Sources.assignees),
            "assignedCreeps": Objects.getter(Sources.assignedCreeps),
            "assign": Objects.function(Sources.assign),
            "unassign": Objects.function(Sources.unassign),
            "unassignAll": Objects.function(Sources.unassignAll),
        }

    private static _classProperties: any =
        {
            "safe": Objects.getter(Sources.safe),
        };

    static setup()
    {
        Object.defineProperties(Source.prototype, Sources._instanceProperties);
        Object.defineProperties(Source, Sources._classProperties);
    }
}