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

    private static getSlots(id: SourceId, source: Opt<Source>): number
    {
        return source !== undefined ? source.room.terrain.walkableAround(source.pos, 1) : 0;
    }

    private static slotsCount(this: Source): number
    {
        return Sources._slots.ensure(this.id, Sources.getSlots, this);
    }

    private static slotsFree(this: Source): number
    {
        return this.slotsCount - this.assignees.size;
    }

    private static workCapacity(this: Source): number
    {
        return this.energyCapacity / ENERGY_REGEN_TIME / 2;
    }

    private static workAssigned(this: Source): number
    {
        return this.assignedCreeps.sum(c => c.workParts);
    }

    private static workFree(this: Source): number
    {
        if (this.slotsFree == 0) return 0;

        return Math.max(0, this.workCapacity - this.workAssigned);
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

    private static safeWorkFree(): number
    {
        return Sources._safe.value.data.sum(s => s.workFree);
    }

    private static _instanceProperties: any =
        {
            "slotsCount": Objects.getter(Sources.slotsCount),
            "slotsFree": Objects.getter(Sources.slotsFree),
            "workCapacity": Objects.getter(Sources.workCapacity),
            "workAssigned": Objects.getter(Sources.workAssigned),
            "workFree": Objects.getter(Sources.workFree),
            "assignees": Objects.getter(Sources.assignees),
            "assignedCreeps": Objects.getter(Sources.assignedCreeps),
            "assign": Objects.function(Sources.assign),
            "unassign": Objects.function(Sources.unassign),
            "unassignAll": Objects.function(Sources.unassignAll),
        }

    private static _classProperties: any =
        {
            "safe": Objects.getter(Sources.safe),
            "safeWorkFree": Objects.getter(Sources.safeWorkFree),
        };

    static setup()
    {
        Object.defineProperties(Source.prototype, Sources._instanceProperties);
        Object.defineProperties(Source, Sources._classProperties);
    }
}