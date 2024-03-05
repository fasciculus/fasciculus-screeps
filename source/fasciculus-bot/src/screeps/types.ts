
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
        get assignedCount(): number;
        get assignedCreeps(): Array<Creep>;

        assign(creep: CreepId): void;
        unassign(creep: CreepId): void;
        unassignAll(): void;
    }

    interface _HasSlots extends _HasId, _HasRoomPosition
    {
        get slotsRange(): number;
        get slotsCount(): number;
        get slotsFree(): number;
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
        get safe(): boolean;

        get transportersAssigned(): number;
        get transportersRequired(): number;
        get transportersFree(): number;
    }

    interface ResourceConstructor
    {
        get known(): Array<Resource>;
        get safe(): Array<Resource>;
    }

    interface Room
    {
        get safe(): boolean;

        get energy(): number;
        get energyCapacity(): number;

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

    interface ScreepsOptions
    {
        transport?: TransportOptions;
        visual?: VisualOptions;
    }

    interface Source extends _HasSlots, _Assignable
    {
        get workCapacity(): number;
        get workAssigned(): number;
        get workFree(): number;
    }

    interface SourceConstructor
    {
        get safe(): Array<Source>;
        get safeWorkFree(): number;
    }

    interface StructureController extends _HasSlots, _Assignable
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

        get transportersAssigned(): number;
        get transportersRequired(): number;
        get transportersFree(): number;

        spawn(kind: string, body: Array<BodyPartConstant>): ScreepsReturnCode;
    }

    interface StructureSpawnConstructor
    {
        get my(): Array<StructureSpawn>;
        get idle(): Array<StructureSpawn>;

        get best(): Opt<StructureSpawn>;

        get transportersRequired(): number;
    }

    interface TransportGoalOptions
    {
        spawns?: boolean;
    }

    interface TransportOptions
    {
        speed?: number;
        transporters?: Array<string>;

        goals?: TransportGoalOptions;
    }

    interface VisualOptions
    {
        paths?: boolean;
        resources?: boolean;
        sources?: boolean;
        spawns?: boolean;
    }
}

export { };
