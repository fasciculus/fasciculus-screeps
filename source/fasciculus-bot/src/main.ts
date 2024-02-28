import { Civil } from "./civ/civil";
import { Transport } from "./civ/transport";
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
        console.log("--------");
        console.log(`more = ${Transport.more()}`);
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

