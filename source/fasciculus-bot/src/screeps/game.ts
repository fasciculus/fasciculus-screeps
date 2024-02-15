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

    private static _classProperties: any =
        {
            "username": Objects.getter(Games.username)
        };

    static setup()
    {
        Object.defineProperties(Game, Games._classProperties);
    }
}