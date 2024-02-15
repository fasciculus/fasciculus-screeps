import { Cached } from "./cache";
import { Rooms } from "./room";

export class Screeps
{
    static setup()
    {
        Rooms.setup();
    }

    static cleanup()
    {
        Cached.cleanup();
    }
}