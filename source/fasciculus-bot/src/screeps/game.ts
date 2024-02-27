import { Objects } from "../es/object";
import { Cached } from "./cache";

export class FlagIds
{
    static isFlagId(id: string): id is FlagId
    {
        return id.startsWith("F_");
    }

    static flagId(flag: Flag): FlagId
    {
        return ("F_" + flag.name) as FlagId;
    }
}

export class Games
{
    private static _unknownUsername: string = "unknown";
    private static _username: Cached<string> = Cached.simple(Games.fetchUsername);

    private static _flags: Cached<Map<FlagId, Flag>> = Cached.simple(Games.fetchFlags);

    private static fetchUsername(): string
    {
        const spawns: Array<StructureSpawn> = Objects.values(Game.spawns);

        return spawns.length == 0 ? Games._unknownUsername : spawns[0].owner.username;
    }

    private static fetchFlags(): Map<FlagId, Flag>
    {
        return Objects.values(Game.flags).indexBy(f => f.id);
    }

    private static username(): string
    {
        return Games._username.value;
    }

    private static get<T extends _HasId>(id: Opt<Id<T>>): Opt<T>
    {
        if (id === undefined) return undefined;
        if (FlagIds.isFlagId(id)) return Games._flags.value.get(id) as Opt<T>;

        const result: T | null = Game.getObjectById(id);

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