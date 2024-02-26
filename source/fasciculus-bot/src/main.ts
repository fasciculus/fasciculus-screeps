import { ES } from "./es/es";
import { Scheduler } from "./schedule";
import { Screeps } from "./screeps/screeps";

ES.setup();

const VERSION = "0.3.3";

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
    Version.run();

    Screeps.setup();

    Experiments.run();

    if (Suicide.execute())
    {
        Scheduler.run();
    }

    Screeps.cleanup();
}

class Version
{
    private static done: boolean = false;

    static run()
    {
        if (Version.done) return;

        console.log(`fasciculus.bot ${VERSION}`);
        Version.done = true;
    }
}
