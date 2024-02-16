import { Objects } from "../es/object";
import { Cached } from "./cache";
import { Terrains } from "./terrain";

class Finder
{
    static sources(room: Room | undefined): Array<Source>
    {
        return room ? room.find<FIND_SOURCES, Source>(FIND_SOURCES) : new Array();
    }
}

export class Rooms
{
    private static _known: Cached<Map<string, Room>> = Cached.simple(Rooms.fetchKnown);
    private static _safe: Cached<Map<string, Room>> = Cached.simple(Rooms.fetchSafe);

    private static _sources: Map<string, Set<SourceId>> = new Map();

    private static fetchKnown(): Map<string, Room>
    {
        return Objects.values(Game.rooms).indexBy(s => s.name);
    }

    private static fetchSafe(): Map<string, Room>
    {
        return Rooms._known.value.filter(Rooms.isSafe);
    }

    private static isSafe(name: string, room: Room)
    {
        return room.controller?.safe || true;
    }

    private static getSources(name: string, hint?: Room): Set<SourceId>
    {
        const room: Room | undefined = hint || Rooms._known.value.get(name);

        return Set.from(Finder.sources(room).map(s => s.id));
    }

    private static safe(this: Room): boolean
    {
        return Rooms._safe.value.has(this.name);
    }

    private static energy(this: Room): number
    {
        return this.energyAvailable || 0;
    }

    private static energyCapacity(this: Room): number
    {
        return this.energyCapacityAvailable || 0;
    }

    private static terrain(this: Room): RoomTerrain
    {
        return Terrains.ofRoom(this);
    }

    private static sources(this: Room): Array<Source>
    {
        return Game.all(Rooms._sources.ensure(this.name, Rooms.getSources, this));
    }

    private static knownRooms(): Array<Room>
    {
        return Rooms._known.value.data;
    }

    private static safeRooms(): Array<Room>
    {
        return Rooms._safe.value.data;
    }

    private static _instanceProperties: any =
        {
            "safe": Objects.getter(Rooms.safe),
            "energy": Objects.getter(Rooms.energy),
            "energyCapacity": Objects.getter(Rooms.energyCapacity),
            "terrain": Objects.getter(Rooms.terrain),
            "sources": Objects.getter(Rooms.sources),
        };

    private static _classProperties: any =
        {
            "known": Objects.getter(Rooms.knownRooms),
            "safe": Objects.getter(Rooms.safeRooms),
        };

    static setup()
    {
        Object.defineProperties(Room.prototype, Rooms._instanceProperties);
        Object.defineProperties(Room, Rooms._classProperties);
    }
}