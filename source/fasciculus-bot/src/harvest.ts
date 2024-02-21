import { HARVESTER } from "./constant";
import { Match, Matcher } from "./match";
import { Blocking } from "./screeps/block";
import { BodyTemplate } from "./screeps/body";
import { Paths } from "./screeps/path";
import { Stores } from "./screeps/store";
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
        return Source.safeWorkFree > 0;
    }

    static run(): void
    {
        Harvest.assign();
        Harvest.harvest();
    }

    private static assign(): void
    {
        const harvesters: Array<Creep> = Creep.ofKind(HARVESTER).filter(c => !c.target);

        if (harvesters.length == 0) return;

        const targets: Array<Assignable> = Harvest.collectTargets();
        const matches: Array<Match> = Matcher.match(harvesters, targets, Harvest.targetValue, Harvest.harvesterValue);

        Matcher.assign(matches);
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

        return source ? source.workFree / Paths.logCost(harvester.pos, target.pos, 1) : -1;
    }

    private static harvesterValue(target: Assignable, harvester: Creep): number
    {
        return 1.0 / Paths.logCost(harvester.pos, target.pos, 1);
    }

    private static harvest(): void
    {
        for (let harvester of Creep.ofKind(HARVESTER))
        {
            const source: Opt<Source> = Targets.source(harvester.target);

            if (!source) continue;

            if (harvester.pos.inRangeTo(source.pos, 1))
            {
                const energyFree: number = Stores.energyFree(harvester);

                if (energyFree < harvester.workParts * 2) continue;

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

        return target !== undefined && creep.pos.inRangeTo(target, 1);
    }
}