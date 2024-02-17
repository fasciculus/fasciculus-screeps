import { ES } from "./es/es";
import { Scheduler } from "./schedule";
import { Screeps } from "./screeps/screeps";

ES.setup();

class Experiments
{
    static run()
    {
        const workParts = Creep.my.map(c => ` ${c.name}: ${c.workParts}`);

        console.log(`workParts = ${workParts}`);
    }
}

export const loop = function ()
{
    Screeps.setup();
    Experiments.run();
    Scheduler.run();
    Screeps.cleanup();
}