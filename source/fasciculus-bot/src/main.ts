import { SCREEPS_OPTIONS } from "./common/constant";
import { Version } from "./common/version";
import { ES } from "./es/es";
import { Scheduler } from "./schedule";
import { Screeps } from "./screeps/screeps";
import { Visuals } from "./screeps/visual";
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
    Screeps.setup(SCREEPS_OPTIONS);
    Experiments.run();
    W7N3.run();
    Scheduler.run();
    Visuals.paint();
    Screeps.cleanup();
}

