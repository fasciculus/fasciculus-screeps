import { BodyInfos } from "./body";
import { Cached } from "./cache";
import { Controllers } from "./controller";
import { Creeps } from "./creep";
import { Memories } from "./memory";
import { Rooms } from "./room";

export class Screeps
{
    static setup()
    {
        Controllers.setup();
        Creeps.setup();
        Memories.setup();
        Rooms.setup();
    }

    static cleanup()
    {
        Cached.cleanup();

        BodyInfos.cleanup();
    }
}