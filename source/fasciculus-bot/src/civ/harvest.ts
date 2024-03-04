import { HARVESTER, PATH_COST_OFFSET } from "../common/constant";
import { Matcher } from "../common/match";
import { Blocking } from "../screeps/block";
import { BodyTemplate } from "../screeps/body";
import { Cached } from "../screeps/cache";
import { Paths } from "../screeps/path";
import { Targets } from "../screeps/target";

export class Harvest
{
    static readonly template = BodyTemplate.createTemplate(HARVESTER, 1, WORK, WORK, MOVE)
        .add(1, WORK, MOVE, MOVE)
        .add(3, WORK, MOVE);

    static readonly blockingRegistered: boolean = Blocking.register(HARVESTER, Harvest.blocking);

    private static _energyHarvested: Cached<number> = Cached.simple(Harvest.fetchEnergyHarvested);

    static more(): boolean
    {
        return Source.safeWorkFree > 0;
    }

    static run(): void
    {
        Harvest.unassign();
        Harvest.assign();
        Harvest.harvest();
    }

    private static fetchEnergyHarvested(): number
    {
        var result: number = 0;

        for (let harvester of Creep.ofKind(HARVESTER))
        {
            const target: Opt<Assignable> = harvester.target;

            if (target === undefined) continue;

            if (harvester.pos.inRangeTo(target.pos, 1))
            {
                result += harvester.workParts * 2 - 1;
            }
        }

        return result;
    }

    static energyHarvested(): number
    {
        return Harvest._energyHarvested.value;
    }

    private static unassign()
    {
        for (let harvester of Creep.ofKind(HARVESTER))
        {
            const resource: Opt<Resource> = Targets.resource(harvester.target);

            if (resource !== undefined && !resource.safe)
            {
                harvester.target = undefined;
            }
        }
    }

    private static assign(): void
    {
        const harvesters: Array<Creep> = Creep.ofKind(HARVESTER).filter(h => h.idle);

        if (harvesters.length == 0) return;

        Matcher.assign(harvesters, Harvest.collectTargets(), Harvest.targetValue, Harvest.harvesterValue);
    }

    private static collectTargets(): Array<Assignable>
    {
        const result: Array<Assignable> = new Array();

        result.append(Harvest.collectSources());

        return result;
    }

    private static collectSources(): Array<Assignable>
    {
        const result: Array<Assignable> = new Array();
        const avgWorkParts: number = Math.max(1.0, Creep.ofKind(HARVESTER).avg(c => c.workParts));

        for (let source of Source.safe)
        {
            const workFree: number = source.workFree;

            if (workFree == 0) continue;

            const count: number = Math.min(source.slotsFree, workFree / avgWorkParts);

            for (let i = 0; i < count; ++i)
            {
                result.push(source);
            }
        }

        return result;
    }

    private static targetValue(harvester: Creep, target: Assignable): number
    {
        return 1.0 / Paths.cost(harvester.pos, target.pos, 1, PATH_COST_OFFSET);
    }

    private static harvesterValue(target: Assignable, harvester: Creep): number
    {
        return 1.0 / Paths.cost(harvester.pos, target.pos, 1, PATH_COST_OFFSET);
    }

    private static harvest(): void
    {
        for (let harvester of Creep.ofKind(HARVESTER))
        {
            const source: Opt<Source> = Targets.source(harvester.target);

            if (source === undefined) continue;

            if (harvester.pos.isNearTo(source.pos))
            {
                harvester.harvest(source);
            }
            else
            {
                harvester.travelTo(source.pos, 1);
            }
        }
    }

    private static blocking(creep: Creep): boolean
    {
        const target: Opt<Assignable> = creep.target;

        return target !== undefined && creep.pos.isNearTo(target.pos);
    }
}