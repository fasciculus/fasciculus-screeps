import { HARVESTER } from "./constant";
import { ES } from "./es/es";
import { Scheduler } from "./schedule";
import { Screeps } from "./screeps/screeps";

ES.setup();

class Suicide
{
    private static done: boolean = true;

    static execute(): boolean
    {
        if (Suicide.done) return true;

        Creep.my.forEach(c => c.suicide());

        Suicide.done = true;

        return false;
    }
}

class Experiments
{
    static run()
    {
    }
}

export const loop = function ()
{
    Screeps.setup();

    Experiments.run();

    if (Suicide.execute())
    {
        Scheduler.run();
    }

    Screeps.cleanup();
}