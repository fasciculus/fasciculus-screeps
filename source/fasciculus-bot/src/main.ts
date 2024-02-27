import { Civilians } from "./civ/civilian";
import { Suicide } from "./common/suicide";
import { Version } from "./common/version";
import { ES } from "./es/es";
import { Screeps } from "./screeps/screeps";
import { Spawning } from "./spawn";

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

    if (Suicide.survive())
    {
        Civilians.run();
        Spawning.run();
    }

    Screeps.cleanup();
}

