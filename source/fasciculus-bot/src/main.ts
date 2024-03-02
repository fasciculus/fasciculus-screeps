import { Version } from "./common/version";
import { ES } from "./es/es";
import { Scheduler } from "./schedule";
import { Screeps } from "./screeps/screeps";

ES.setup();

class Experiments
{
    static run()
    {
    }
}

export const loop = function ()
{
    Version.run();
    Screeps.setup();
    Experiments.run();
    Scheduler.run();
    Screeps.cleanup();
}

