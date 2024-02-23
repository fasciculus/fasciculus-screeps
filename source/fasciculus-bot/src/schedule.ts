import { Harvest } from "./harvest";
import { Spawning } from "./spawn";
import { Transport } from "./transport";
import { Work } from "./work";

export class Scheduler
{
    static run()
    {
        Harvest.run();
        Transport.run();
        Work.run();

        Spawning.run();
    }
}