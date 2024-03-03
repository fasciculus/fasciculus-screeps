import { TRANSPORTER } from "./common/constant";
import { Version } from "./common/version";
import { ES } from "./es/es";
import { Scheduler } from "./schedule";
import { Screeps } from "./screeps/screeps";
import { Visuals } from "./screeps/visual";
import { W7N3 } from "./w7n3";

ES.setup();

const SCREEPS_OPTIONS: ScreepsOptions =
{
    resource:
    {
        targets: [STRUCTURE_SPAWN],
        transporters: [TRANSPORTER],
        speed: 1
    },

    visual:
    {
        paths: false,
        resources: true
    }
};

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

