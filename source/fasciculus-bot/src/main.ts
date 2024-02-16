import { ES } from "./es/es";
import { Scheduler } from "./schedule";
import { Screeps } from "./screeps/screeps";

ES.setup();

class Experiments
{
    static run()
    {
        const sources: Array<Source> = Source.safe;
        const creeps: Array<Creep> = Creep.my;

        if (sources.length == 0) return;

        const source: Source = sources[0];
        const assignees: Set<CreepId> = source.assignees;

        console.log(`assignees (before) = ${source.assignedCreeps}`)

        if (assignees.size >= 2)
        {
            source.unassignAll();
        }
        else
        {
            for (let creep of creeps)
            {
                if (!assignees.has(creep.id))
                {
                    source.assign(creep.id);
                    break;
                }
            }
        }

        console.log(`assignees (after) = ${source.assignedCreeps}`)
    }
}

export const loop = function ()
{
    Screeps.setup();
    Experiments.run();
    Scheduler.run();
    Screeps.cleanup();
}