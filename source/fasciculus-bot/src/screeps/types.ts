
declare global
{
    type ControllerId = Id<StructureController>;
    type CreepId = Id<Creep>;

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
}

export { }
