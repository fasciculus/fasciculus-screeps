import { Assignees } from "./assign";
import { BodyInfos } from "./body";
import { Cached } from "./cache";
import { Controllers } from "./controller";
import { Creeps } from "./creep";
import { Games } from "./game";
import { Memories } from "./memory";
import { RoomPositions } from "./pos";
import { Rooms } from "./room";
import { Sources } from "./source";
import { Spawns } from "./spawn";
import { Terrains } from "./terrain";

export class Screeps
{
    static setup()
    {
        Controllers.setup();
        Creeps.setup();
        Games.setup();
        Memories.setup();
        Rooms.setup();
        RoomPositions.setup();
        Sources.setup();
        Spawns.setup();
        Terrains.setup();

        Assignees.setup();
    }

    static cleanup()
    {
        Cached.cleanup();

        BodyInfos.cleanup();
    }
}