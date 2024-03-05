import { Terrains } from "./terrain";

export class Slots
{
    private static _slots: Map<string, number> = new Map();

    private static fetchSlots(id: string, hs?: _HasSlots): number
    {
        if (hs === undefined) return 0;

        const pos: RoomPosition = hs.pos;

        return Terrains.walkable(pos, hs.slotsRange);
    }

    static slotsCount(hs: _HasSlots): number
    {
        return Slots._slots.ensure(hs.id, Slots.fetchSlots, hs);
    }
}