import { Cached } from "./cache";
import { Controllers } from "./controller";
import { Rooms } from "./room";

export class Screeps
{
    static setup()
    {
        Controllers.setup();
        Rooms.setup();
    }

    static cleanup()
    {
        Cached.cleanup();
    }
}