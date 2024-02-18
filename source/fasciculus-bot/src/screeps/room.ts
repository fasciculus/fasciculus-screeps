import { Objects } from "../es/object";
import { Cached } from "./cache";
import { Terrains } from "./terrain";

class Finder
{
    private static _obstacleTypes: Set<string> = new Set([
        "constructedWall",
        "controller",
        "deposit",
        "extension",
        "factory",
        "invaderCore",
        "lab",
        "link",
        "mineral",
        "nuker",
        "observer",
        "powerBank",
        "powerSpawn",
        "source",
        "spawn",
        "storage",
        "terminal",
        "tower"
    ]);

    private static createTypeFilterOptions<T extends FindConstant, S extends FindTypes[T] = FindTypes[T]>(type: string): FilterOptions<T, S>
    {
        return { filter: { structureType: type } };
    }

    private static _myRampartFilterOptions: FilterOptions<FIND_MY_STRUCTURES, StructureRampart> =
        Finder.createTypeFilterOptions(STRUCTURE_RAMPART);

    private static _obstacleFilterOptions: FilterOptions<FIND_STRUCTURES, AnyStructure> =
        {
            filter: Finder.isObstacle
        };

    private static isObstacle(structure: AnyStructure): boolean
    {
        return Finder._obstacleTypes.has(structure.structureType);
    }

    static obstacles(room: Room | undefined): Array<AnyStructure>
    {
        return room ? room.find<FIND_STRUCTURES, AnyStructure>(FIND_STRUCTURES, Finder._obstacleFilterOptions) : new Array();
    }

    static sources(room: Room | undefined): Array<Source>
    {
        return room ? room.find<FIND_SOURCES, Source>(FIND_SOURCES) : new Array();
    }

    static myRamparts(room: Room | undefined): Array<StructureRampart>
    {
        return room ? room.find<FIND_MY_STRUCTURES, StructureRampart>(FIND_MY_STRUCTURES, Finder._myRampartFilterOptions) : new Array();
    }

    static creeps(room: Room | undefined): Array<Creep>
    {
        return room ? room.find<FIND_CREEPS, Creep>(FIND_CREEPS) : new Array();
    }
}

export class Rooms
{
    private static _known: Cached<Map<string, Room>> = Cached.simple(Rooms.fetchKnown);
    private static _safe: Cached<Map<string, Room>> = Cached.simple(Rooms.fetchSafe);

    private static _obstacles: Cached<Map<string, Array<AnyStructure>>> = Cached.simple(() => new Map());
    private static _sources: Map<string, Set<SourceId>> = new Map();

    private static _myRamparts: Cached<Map<string, Array<StructureRampart>>> = Cached.simple(() => new Map());

    private static _creeps: Cached<Map<string, Array<Creep>>> = Cached.simple(() => new Map());

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

    private static findObstacles(name: string, hint?: Room): Array<AnyStructure>
    {
        const room: Room | undefined = hint || Rooms._known.value.get(name);

        return Finder.obstacles(room);
    }

    private static findSources(name: string, hint?: Room): Set<SourceId>
    {
        const room: Room | undefined = hint || Rooms._known.value.get(name);

        return Set.from(Finder.sources(room).map(s => s.id));
    }

    private static findMyRamparts(name: string, hint?: Room): Array<StructureRampart>
    {
        const room: Room | undefined = hint || Rooms._known.value.get(name);

        return Finder.myRamparts(room);
    }

    private static getCreeps(name: string, hint?: Room): Array<Creep>
    {
        const room: Room | undefined = hint || Rooms._known.value.get(name);

        return Finder.creeps(room);
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

    private static obstacles(this: Room): Array<AnyStructure>
    {
        return Rooms._obstacles.value.ensure(this.name, Rooms.findObstacles, this);
    }

    private static sources(this: Room): Array<Source>
    {
        return Game.all(Rooms._sources.ensure(this.name, Rooms.findSources, this));
    }

    private static myRamparts(this: Room): Array<StructureRampart>
    {
        return Rooms._myRamparts.value.ensure(this.name, Rooms.findMyRamparts, this);
    }

    private static creeps(this: Room): Array<Creep>
    {
        return Rooms._creeps.value.ensure(this.name, Rooms.getCreeps, this);
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
            "obstacles": Objects.getter(Rooms.obstacles),
            "sources": Objects.getter(Rooms.sources),
            "myRamparts": Objects.getter(Rooms.myRamparts),
            "creeps": Objects.getter(Rooms.creeps),
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