import { Assignees } from "./assign";
import { BodyInfos } from "./body";
import { Cached } from "./cache";
import { ScreepsConfig } from "./config";
import { Controllers } from "./controller";
import { Creeps } from "./creep";
import { Flags } from "./flag";
import { Games } from "./game";
import { Memories } from "./memory";
import { RoomPositions } from "./pos";
import { Resources } from "./resource";
import { Rooms } from "./room";
import { Sites } from "./site";
import { Sources } from "./source";
import { Spawns } from "./spawn";
import { Targets } from "./target";
import { Terrains } from "./terrain";

export class Screeps
{
    static setup(opts: ScreepsOptions)
    {
        ScreepsConfig.setup(opts);

        Controllers.setup();
        Creeps.setup();
        Flags.setup();
        Games.setup();
        Memories.setup();
        Resources.setup();
        Rooms.setup();
        RoomPositions.setup();
        Sites.setup();
        Sources.setup();
        Spawns.setup();
        Terrains.setup();

        BodyInfos.setup();
        Assignees.setup();
        Targets.setup();
    }

    static cleanup()
    {
        Cached.cleanup();
    }
}