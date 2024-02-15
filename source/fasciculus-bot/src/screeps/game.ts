import { Objects } from "../es/object";
import { Cached } from "./cache";

export class Games
{
    private static _unknownUsername: string = "unknown";
    private static _username: Cached<string> = Cached.simple(Games.fetchUsername);

    private static fetchUsername(): string
    {
        const spawns: Array<StructureSpawn> = Objects.values(Game.spawns);

        return spawns.length == 0 ? Games._unknownUsername : spawns[0].owner.username;
    }

    private static username(): string
    {
        return Games._username.value;
    }

    private static get<T extends _HasId>(id: Id<T> | undefined): T | undefined
    {
        let result: T | null = id ? Game.getObjectById(id) : null;

        return result || undefined;
    }

    private static all<T extends _HasId>(ids: Set<Id<T>> | undefined): Array<T>
    {
        return ids ? Array.defined(ids.map(Games.get)) : new Array();
    }

    private static existing<T extends _HasId>(ids: Set<Id<T>>): Set<Id<T>>
    {
        return ids.filter(id => Games.get(id) !== undefined);
    }

    private static _classProperties: any =
        {
            "username": Objects.getter(Games.username),
            "get": Objects.function(Games.get),
            "all": Objects.function(Games.all),
            "existing": Objects.function(Games.existing),
        };

    static setup()
    {
        Object.defineProperties(Game, Games._classProperties);
    }
}