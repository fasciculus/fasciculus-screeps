import { Civil } from "./civ/civil";
import { Military } from "./mil/military";
import { Spawning } from "./spawn";
import { Logistics } from "./common/logistic";
import { Suicide } from "./common/suicide";
import { Infos } from "./info";

export class Scheduler
{
    static run()
    {
        if (!Suicide.survive()) return;

        Logistics.setup();

        Military.run();
        Civil.run();
        Spawning.run();
        Infos.run();

        Logistics.update();
    }
}