
declare global
{
    type ControllerId = Id<StructureController>;
    type CreepId = Id<Creep>;
    type SpawnId = Id<StructureSpawn>;

    type BodyInfo = { work: number };

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
    }

    interface RoomConstructor
    {
        get safe(): Array<Room>;
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
