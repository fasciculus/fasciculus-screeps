import { Harvest } from "./harvest";
import { Spawning } from "./spawn";

export class Scheduler
{
    static run()
    {
        Harvest.run();

        Spawning.run();
    }
}