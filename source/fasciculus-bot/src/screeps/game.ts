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

    private static get<T extends _HasId>(id: Opt<Id<T>>): Opt<T>
    {
        let result: T | null = id !== undefined ? Game.getObjectById(id) : null;

        if (result == null) return undefined;

        return result;
    }

    private static all<T extends _HasId>(ids: Opt<Set<Id<T>>>): Array<T>
    {
        if (ids === undefined) return new Array();

        return Array.defined(ids.map(Games.get));
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