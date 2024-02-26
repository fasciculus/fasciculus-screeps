import { Harvest } from "./civ/harvest";
import { Spawning } from "./spawn";
import { Transport } from "./civ/transport";
import { Work } from "./civ/work";

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