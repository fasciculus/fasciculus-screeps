import { ES } from "./es/es";
import { Scheduler } from "./schedule";
import { Screeps } from "./screeps/screeps";

ES.setup();

class Experiments
{
    static run()
    {
        const assignedWork = Source.safe.map(s => ` ${s.id}: ${s.assignedWork}/${s.workCapacity}`);

        console.log(`assignedWork = ${assignedWork}`);
    }
}

export const loop = function ()
{
    Screeps.setup();
    Experiments.run();
    Scheduler.run();
    Screeps.cleanup();
}