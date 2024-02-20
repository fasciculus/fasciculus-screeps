import { Harvest } from "./harvest";
import { Spawning } from "./spawn";
import { Transport } from "./transport";

export class Scheduler
{
    static run()
    {
        Harvest.run();
        Transport.run();

        Spawning.run();
    }
}