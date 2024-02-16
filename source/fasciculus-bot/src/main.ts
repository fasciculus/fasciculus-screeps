import { ES } from "./es/es";
import { Scheduler } from "./schedule";
import { Screeps } from "./screeps/screeps";

ES.setup();

class Experiments
{
    static run()
    {
        const sources: Array<Source> = Source.safe;

        if (sources.length == 0) return;

        const source: Source = sources[0];
        const slot: SourceSlot = new SourceSlot(source);

        console.log(`${slot.sourceId}, ${slot.source.id}`);
    }
}

export const loop = function ()
{
    Screeps.setup();
    Experiments.run();
    Scheduler.run();
    Screeps.cleanup();
}