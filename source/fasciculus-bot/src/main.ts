import { Version } from "./common/version";
import { ES } from "./es/es";
import { Scheduler } from "./schedule";
import { Screeps } from "./screeps/screeps";
import { W7N3 } from "./w7n3";

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
    W7N3.run();
    Scheduler.run();
    Screeps.cleanup();
}

