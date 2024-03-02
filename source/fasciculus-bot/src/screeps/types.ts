
declare global
{
    type ControllerId = Id<StructureController>;
    type CreepId = Id<Creep>;
    type FlagId = Id<Flag>;
    type ResourceId = Id<Resource>;
    type SiteId = Id<ConstructionSite>;
    type SourceId = Id<Source>;
    type SpawnId = Id<StructureSpawn>;

    type BodyInfo = { carry: number, work: number };

    type Assignable =
        | Creep
        | ConstructionSite
        | Flag
        | Resource
        | Source
        | StructureController
        | StructureSpawn;

    type AssignableId = Id<Assignable>;

    interface _Assignable
    {
        get assignees(): Set<CreepId>;
        get assignedCreeps(): Array<Creep>;

        assign(creep: CreepId): void;
        unassign(creep: CreepId): void;
        unassignAll(): void;
    }

    interface _HasStore
    {
        store: StoreDefinition;
    }

    interface ConstructionSite extends _Assignable
    {
    }

    interface ConstructionSiteConstructor
    {
        get my(): Array<ConstructionSite>;
    }

    interface Creep extends _Assignable
    {
        get kind(): string;

        get target(): Opt<Assignable>;
        set target(value: Opt<Assignable>);
        get idle(): boolean;

        get blocking(): boolean;

        get carryParts(): number;
        get workParts(): number;

        travelTo(goal: RoomPosition, range: number): CreepMoveReturnCode | ERR_NO_PATH;
    }

    interface CreepConstructor
    {
        get my(): Array<Creep>;

        ofKind(kind: string): Array<Creep>;
    }

    interface Flag extends _HasId, _Assignable
    {
        get id(): Id<this>;
        get kind(): string;
    }

    interface FlagConstructor
    {
        get my(): Array<Flag>;

        ofKind(kind: string): Array<Flag>;
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

    interface Resource extends _Assignable
    {
        get cost(): Opt<number>;
    }

    interface ResourceConstructor
    {
        get known(): Array<Resource>;
        get safe(): Array<Resource>;
    }

    interface ResourceOptions
    {
        targets?: Array<StructureConstant>;
    }

    interface Room
    {
        get safe(): boolean;

        get energy(): number;
        get energyCapacity(): number;

        get terrain(): RoomTerrain;

        get obstacles(): Array<AnyStructure>;
        get resources(): Array<Resource>;
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
        walkableAtRange(pos: RoomPosition, range: number): number;
    }

    interface ScreepsOptions
    {
        resource?: ResourceOptions;
        transport?: TransportOptions;
    }

    interface Source extends _Assignable
    {
        get slotsCount(): number;
        get slotsFree(): number;

        get workCapacity(): number;
        get workAssigned(): number;
        get workFree(): number;
    }

    interface SourceConstructor
    {
        get safe(): Array<Source>;
        get safeWorkFree(): number;
    }

    interface StructureController extends _Assignable
    {
        get safe(): boolean;

        get blocked(): boolean;

        get slotsCount(): number;
        get slotsFree(): number;
    }

    interface StructureControllerConstructor
    {
        get my(): Array<StructureController>;
        get myReserved(): Array<StructureController>;
    }

    interface StructureSpawn extends _Assignable
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

    interface TransportOptions
    {
    }
}

export { }
