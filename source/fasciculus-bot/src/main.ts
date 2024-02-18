import { ES } from "./es/es";
import { Scheduler } from "./schedule";
import { Paths } from "./screeps/path";
import { Screeps } from "./screeps/screeps";

ES.setup();

class Experiments
{
    static run()
    {
        const origin = Spawn.my[0];
        const goal = Source.safe[0];
        const cost = Paths.cost(origin.pos, goal.pos, 1);

        console.log(`cost = ${cost}`);
    }
}

export const loop = function ()
{
    Screeps.setup();
    Experiments.run();
    Scheduler.run();
    Screeps.cleanup();
}