
declare global
{
    type ControllerId = Id<StructureController>;
    type CreepId = Id<Creep>;
    type SourceId = Id<Source>;
    type SpawnId = Id<StructureSpawn>;

    type BodyInfo = { work: number };

    type AssignableId = Id<Source>;

    interface _Assignable
    {
        get assignees(): Set<CreepId>;
        get assignedCreeps(): Array<Creep>;

        assign(creep: CreepId): void;
        unassign(creep: CreepId): void;
        unassignAll(): void;
    }

    export type Assignable = Source;

    interface Creep
    {
        get kind(): string;

        get target(): Opt<Assignable>;
        set target(value: Opt<Assignable>);

        get blocking(): boolean;

        get workParts(): number;
    }

    interface CreepConstructor
    {
        get my(): Array<Creep>;

        ofKind(kind: string): Array<Creep>;
    }

    interface Game
    {
        get username(): string;

        get<T extends _HasId>(id: Opt<Id<T>>): Opt<T>;
        all<T extends _HasId>(ids: Opt<Set<Id<T>>>): Array<T>;

        existing<T extends _HasId>(ids: Set<Id<T>>): Set<Id<T>>;
    }

    interface Memory
    {
        [index: string]: any;

        get<T>(key: string, initial: T): T;
    }

    interface Room
    {
        get safe(): boolean;

        get energy(): number;
        get energyCapacity(): number;

        get terrain(): RoomTerrain;

        get obstacles(): Array<AnyStructure>;
        get sources(): Array<Source>;

        get roads(): Array<StructureRoad>;
        get myRamparts(): Array<StructureRampart>;

        get creeps(): Array<Creep>;
        get hostileCreeps(): Array<Creep>;

        get attacked(): boolean;
    }

    interface RoomConstructor
    {
        get(name: string): Opt<Room>;

        get known(): Array<Room>;
        get safe(): Array<Room>;
    }

    interface RoomPosition
    {
        forEachAround(range: number, fn: (x: number, y: number) => void): void;
        forEachAtRange(range: number, fn: (x: number, y: number) => void): void;
    }

    interface RoomTerrain
    {
        walkableAround(pos: RoomPosition, range: number): number;
    }

    interface Source extends _Assignable
    {
        get slots(): number;
        get freeSlots(): number;

        get workCapacity(): number;
        get freeWork(): number;
        get assignedWork(): number;
    }

    interface SourceConstructor
    {
        get safe(): Array<Source>;
        get safeFreeWork(): number;
    }

    interface StructureController
    {
        get safe(): boolean;
    }

    interface StructureSpawn
    {
        get roomEnergy(): number;
        get roomEnergyCapacity(): number;

        spawn(kind: string, body: Array<BodyPartConstant>): ScreepsReturnCode;
    }

    interface StructureSpawnConstructor
    {
        get my(): Array<StructureSpawn>;
        get idle(): Array<StructureSpawn>;

        get best(): Opt<StructureSpawn>;
    }
}

export { }
