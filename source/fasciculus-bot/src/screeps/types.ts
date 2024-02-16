
declare global
{
    type ControllerId = Id<StructureController>;
    type CreepId = Id<Creep>;
    type SourceId = Id<Source>;
    type SpawnId = Id<StructureSpawn>;

    type BodyInfo = { work: number };

    type AssignableId = Id<Source>;

    interface Assignable
    {
        get assignees(): Set<CreepId>;
        get assignedCreeps(): Array<Creep>;

        assign(creep: CreepId): void;
        unassign(creep: CreepId): void;
        unassignAll(): void;
    }

    interface Creep
    {
        get type(): string;
    }

    interface CreepConstructor
    {
        get my(): Array<Creep>;
    }

    interface Game
    {
        get username(): string;

        get<T extends _HasId>(id: Id<T> | undefined): T | undefined;
        all<T extends _HasId>(ids: Set<Id<T>> | undefined): Array<T>;

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

        get sources(): Array<Source>;
    }

    interface RoomConstructor
    {
        get known(): Array<Room>;
        get safe(): Array<Room>;
    }

    interface Source extends Assignable
    {
    }

    interface SourceConstructor
    {
        get safe(): Array<Source>;
    }

    interface StructureController
    {
        get safe(): boolean;
    }

    interface StructureSpawn
    {
        spawn(type: string, body: Array<BodyPartConstant>): ScreepsReturnCode;
    }

    interface StructureSpawnConstructor
    {
        get my(): Array<StructureSpawn>;
        get idle(): Array<StructureSpawn>;
    }
}

export { }
