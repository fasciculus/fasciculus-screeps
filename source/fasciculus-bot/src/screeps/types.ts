
declare global
{
    type ControllerId = Id<StructureController>;

    interface Game
    {
        get username(): string;

        get<T extends _HasId>(id: Id<T> | undefined): T | undefined;
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
