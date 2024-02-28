import { Civil } from "./civ/civil";
import { Suicide } from "./common/suicide";
import { Version } from "./common/version";
import { ES } from "./es/es";
import { Military } from "./mil/military";
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
        Military.run();
        Civil.run();
        Spawning.run();
    }

    Screeps.cleanup();
}

