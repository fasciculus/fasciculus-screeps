import { ES } from "./es/es";
import { Scheduler } from "./schedule";
import { Screeps } from "./screeps/screeps";

ES.setup();

class Experiments
{
    static run()
    {
        const wellers = Creep.ofKind("W");

        wellers.forEach(w => w.blocking = true);

        const creeps = Creep.my.map(c => ` ${c.name}: ${c.blocking}`);

        console.log(`creeps = ${creeps}`);
    }
}

export const loop = function ()
{
    Screeps.setup();
    Experiments.run();
    Scheduler.run();
    Screeps.cleanup();
}