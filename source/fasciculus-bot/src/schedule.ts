import { Civil } from "./civ/civil";
import { Suicide } from "./common/suicide";
import { Infos } from "./info";
import { Military } from "./mil/military";
import { Spawning } from "./spawn";

export class Scheduler
{
    static run()
    {
        if (!Suicide.survive()) return;

        Military.run();
        Civil.run();
        Spawning.run();
        Infos.run();
    }
}