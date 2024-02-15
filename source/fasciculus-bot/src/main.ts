import { ES } from "./es/es";
import { Scheduler } from "./schedule";
import { Screeps } from "./screeps/screeps";

ES.setup();

export const loop = function ()
{
    Screeps.setup();
    Scheduler.run();
    Screeps.cleanup();
}