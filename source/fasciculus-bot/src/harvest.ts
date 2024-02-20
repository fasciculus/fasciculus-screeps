import { Match, Matcher } from "./alg/match";
import { HARVESTER } from "./constant";
import { Blocking } from "./screeps/block";
import { BodyTemplate } from "./screeps/body";
import { Paths } from "./screeps/path";
import { Targets } from "./screeps/target";

export class Harvest
{
    static readonly template = BodyTemplate.createTemplate(HARVESTER, 1, WORK, CARRY, MOVE)
        .add(1, WORK, MOVE)
        .add(1, WORK, CARRY, MOVE)
        .add(2, WORK, MOVE);

    static readonly blockingRegistered: boolean = Blocking.register(HARVESTER, Harvest.blocking);

    static more(): boolean
    {
        return Creep.ofKind(HARVESTER).sum(c => c.workParts) < Source.safeFreeWork;
    }

    static run()
    {
        Harvest.assign();
        Harvest.harvest();
    }

    private static assign()
    {
        const creeps: Array<Creep> = Creep.ofKind(HARVESTER).filter(c => !c.target);

        if (creeps.length == 0) return;

        const sources: Array<Source> = Source.safe.filter(s => s.freeWork > 0 && s.freeSlots > 0);

        if (sources.length == 0) return;

        console.log(`matching ${creeps.length} creeps to ${sources.length} sources`);

        const matches: Array<Match<Creep, Source>> = Matcher.match(creeps, sources, Harvest.sourceValue, Harvest.creepValue);

        for (let match of matches)
        {
            console.log(`assigned ${match.left} to ${match.right.id}`);
            match.left.target = match.right;
        }
    }

    private static sourceValue(creep: Creep, source: Source): number
    {
        return source.freeWork * 10 - Paths.cost(creep.pos, source.pos, 1);
    }

    private static creepValue(source: Source, creep: Creep): number
    {
        return creep.workParts * 10 - Paths.cost(creep.pos, source.pos, 1);
    }

    private static harvest()
    {
        for (let creep of Creep.ofKind(HARVESTER))
        {
            const source: Opt<Source> = Targets.source(creep.target);

            if (!source) continue;

            if (creep.pos.inRangeTo(source.pos, 1))
            {
                if (creep.freeEnergyCapacity < creep.workParts * 2) continue;

                creep.harvest(source);
            }
            else
            {
                creep.travelTo(source.pos, 1)
            }
        }
    }

    private static blocking(creep: Creep): boolean
    {
        const target: Opt<Assignable> = creep.target;

        return target !== undefined && creep.pos.inRangeTo(target, 1);
    }
}