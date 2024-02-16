import { BodyInfos } from "./body";
import { Cached } from "./cache";
import { Controllers } from "./controller";
import { Creeps } from "./creep";
import { Games } from "./game";
import { Memories } from "./memory";
import { Rooms } from "./room";
import { Sources } from "./source";
import { Spawns } from "./spawn";

export class Screeps
{
    static setup()
    {
        Controllers.setup();
        Creeps.setup();
        Games.setup();
        Memories.setup();
        Rooms.setup();
        Sources.setup();
        Spawns.setup();
    }

    static cleanup()
    {
        Cached.cleanup();

        BodyInfos.cleanup();
    }
}