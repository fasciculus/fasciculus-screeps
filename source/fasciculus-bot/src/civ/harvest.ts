import { HARVESTER, PATH_COST_OFFSET } from "../common/constant";
import { Matcher } from "../common/match";
import { Blocking } from "../screeps/block";
import { BodyTemplate } from "../screeps/body";
import { Paths } from "../screeps/path";
import { Targets } from "../screeps/target";

export class Harvest
{
    static readonly template = BodyTemplate.createTemplate(HARVESTER, 1, WORK, WORK, MOVE)
        .add(1, WORK, MOVE, MOVE)
        .add(3, WORK, MOVE);

    static readonly blockingRegistered: boolean = Blocking.register(HARVESTER, Harvest.blocking);

    static more(): boolean
    {
        return Source.safeWorkFree > 0;
    }

    static run(): void
    {
        Harvest.assign();
        Harvest.harvest();
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
        const source: Opt<Source> = Targets.source(target);

        return source !== undefined ? source.workFree / Paths.cost(harvester.pos, target.pos, 1, PATH_COST_OFFSET) : -1;
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