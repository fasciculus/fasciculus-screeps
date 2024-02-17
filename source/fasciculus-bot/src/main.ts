import { ES } from "./es/es";
import { Scheduler } from "./schedule";
import { Screeps } from "./screeps/screeps";

ES.setup();

class Experiments
{
    static run()
    {
        const obstacles = Room.known[0].obstacles.map(o => ` ${o.id}: ${o.structureType}`);

        console.log(`obstacles = ${obstacles}`);
    }
}

export const loop = function ()
{
    Screeps.setup();
    Experiments.run();
    Scheduler.run();
    Screeps.cleanup();
}