import { Civil } from "./civ/civil";
import { Military } from "./mil/military";
import { Spawning } from "./spawn";
import { Logistics } from "./common/logistic";
import { Suicide } from "./common/suicide";

export class Scheduler
{
    static run()
    {
        if (!Suicide.survive()) return;

        Logistics.setup();

        Military.run();
        Civil.run();
        Spawning.run();

        Logistics.update();
    }
}