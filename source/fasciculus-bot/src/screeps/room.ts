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

    private static createTypeOpts<T extends FindConstant, S extends FindTypes[T] = FindTypes[T]>(type: string): FilterOptions<T, S>
    {
        return { filter: { structureType: type } };
    }

    private static _roadOpts: FilterOptions<FIND_STRUCTURES, StructureRoad> = Finder.createTypeOpts(STRUCTURE_ROAD);
    private static _myRampartOpts: FilterOptions<FIND_MY_STRUCTURES, StructureRampart> = Finder.createTypeOpts(STRUCTURE_RAMPART);
    private static _obstacleOpts: FilterOptions<FIND_STRUCTURES, AnyStructure> = { filter: Finder.isObstacle };

    private static isObstacle(structure: AnyStructure): boolean
    {
        return Finder._obstacleTypes.has(structure.structureType);
    }

    static obstacles(room: Room | undefined): Array<AnyStructure>
    {
        return room ? room.find<FIND_STRUCTURES, AnyStructure>(FIND_STRUCTURES, Finder._obstacleOpts) : new Array();
    }

    static sources(room: Room | undefined): Array<Source>
    {
        return room ? room.find<FIND_SOURCES, Source>(FIND_SOURCES) : new Array();
    }

    static roads(room: Room | undefined): Array<StructureRoad>
    {
        return room ? room.find<FIND_STRUCTURES, StructureRoad>(FIND_STRUCTURES, Finder._roadOpts) : new Array();
    }

    static myRamparts(room: Room | undefined): Array<StructureRampart>
    {
        return room ? room.find<FIND_MY_STRUCTURES, StructureRampart>(FIND_MY_STRUCTURES, Finder._myRampartOpts) : new Array();
    }

    static creeps(room: Room | undefined): Array<Creep>
    {
        return room ? room.find<FIND_CREEPS, Creep>(FIND_CREEPS) : new Array();
    }

    static hostileCreeps(room: Room | undefined): Array<Creep>
    {
        return room ? room.find<FIND_HOSTILE_CREEPS, Creep>(FIND_HOSTILE_CREEPS) : new Array();
    }
}

export class Rooms
{
    private static _known: Cached<Map<string, Room>> = Cached.simple(Rooms.fetchKnown);
    private static _safe: Cached<Map<string, Room>> = Cached.simple(Rooms.fetchSafe);

    private static _obstacles: Cached<Map<string, Array<AnyStructure>>> = Cached.simple(() => new Map());
    private static _sources: Map<string, Set<SourceId>> = new Map();

    private static _roads: Cached<Map<string, Array<StructureRoad>>> = Cached.simple(() => new Map());
    private static _myRamparts: Cached<Map<string, Array<StructureRampart>>> = Cached.simple(() => new Map());

    private static _creeps: Cached<Map<string, Array<Creep>>> = Cached.simple(() => new Map());
    private static _hostileCreeps: Cached<Map<string, Array<Creep>>> = Cached.simple(() => new Map());

    private static _attacked: Cached<Map<string, boolean>> = Cached.simple(() => new Map());

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

    private static findRoads(name: string, hint?: Room): Array<StructureRoad>
    {
        const room: Room | undefined = hint || Rooms._known.value.get(name);

        return Finder.roads(room);
    }

    private static findMyRamparts(name: string, hint?: Room): Array<StructureRampart>
    {
        const room: Room | undefined = hint || Rooms._known.value.get(name);

        return Finder.myRamparts(room);
    }

    private static findCreeps(name: string, hint?: Room): Array<Creep>
    {
        const room: Room | undefined = hint || Rooms._known.value.get(name);

        return Finder.creeps(room);
    }

    private static findHostileCreeps(name: string, hint?: Room): Array<Creep>
    {
        const room: Room | undefined = hint || Rooms._known.value.get(name);

        return Finder.hostileCreeps(room);
    }

    private static isAttacked(name: string, hint?: Room): boolean
    {
        const room: Room | undefined = hint || Rooms._known.value.get(name);

        return room ? room.safe && room.hostileCreeps.length > 0 : false;
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

    private static roads(this: Room): Array<StructureRoad>
    {
        return Rooms._roads.value.ensure(this.name, Rooms.findRoads, this);
    }

    private static myRamparts(this: Room): Array<StructureRampart>
    {
        return Rooms._myRamparts.value.ensure(this.name, Rooms.findMyRamparts, this);
    }

    private static creeps(this: Room): Array<Creep>
    {
        return Rooms._creeps.value.ensure(this.name, Rooms.findCreeps, this);
    }

    private static hostileCreeps(this: Room): Array<Creep>
    {
        return Rooms._hostileCreeps.value.ensure(this.name, Rooms.findHostileCreeps, this);
    }

    private static attacked(this: Room): boolean
    {
        return Rooms._attacked.value.ensure(this.name, Rooms.isAttacked, this);
    }

    private static get(name: string): Room | undefined
    {
        return Rooms._known.value.get(name);
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
            "roads": Objects.getter(Rooms.roads),
            "creeps": Objects.getter(Rooms.creeps),
            "hostileCreeps": Objects.getter(Rooms.hostileCreeps),
            "attacked": Objects.getter(Rooms.attacked),
        };

    private static _classProperties: any =
        {
            "get": Objects.function(Rooms.get),
            "known": Objects.getter(Rooms.knownRooms),
            "safe": Objects.getter(Rooms.safeRooms),
        };

    static setup()
    {
        Object.defineProperties(Room.prototype, Rooms._instanceProperties);
        Object.defineProperties(Room, Rooms._classProperties);
    }
}