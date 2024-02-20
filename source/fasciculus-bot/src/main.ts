import { Matcher } from "./alg/match";
import { ES } from "./es/es";
import { Scheduler } from "./schedule";
import { Paths } from "./screeps/path";
import { Screeps } from "./screeps/screeps";

ES.setup();

class Experiments
{
    static sourceValue(creep: Creep, source: Source): number
    {
        return source.freeWork * 10 - Paths.cost(creep.pos, source.pos, 1);
    }

    static creepValue(source: Source, creep: Creep): number
    {
        const workMatch = creep.workParts * 10 - Paths.cost(creep.pos, source.pos, 1);

        return workMatch - Paths.cost(creep.pos, source.pos, 1);
    }

    static run()
    {
    //    const start: number = Game.cpu.getUsed();
    //    const creeps = Creep.my;
    //    const sources = Source.safe;
    //    const matches = Matcher.match(creeps, sources, Experiments.sourceValue, Experiments.creepValue);
    //    const duration = Game.cpu.getUsed() - start;
    //    const texts = matches.map(m => ` ${m.left.name} -> ${m.right.id}`);

    //    console.log(`matches:${texts}`);
    //    console.log(`duration: ${duration.toFixed(2)}`);
    }
}

export const loop = function ()
{
    Screeps.setup();
    Experiments.run();
    Scheduler.run();
    Screeps.cleanup();
}