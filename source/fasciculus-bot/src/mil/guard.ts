import { GUARD, PATH_COST_OFFSET } from "../common/constant";
import { Matcher } from "../common/match";
import { Blocking } from "../screeps/block";
import { BodyTemplate } from "../screeps/body";
import { Paths } from "../screeps/path";
import { Targets } from "../screeps/target";

export class Guards
{
    static readonly template = BodyTemplate.createTemplate(GUARD, 1, MOVE);

    static readonly blockingRegistered: boolean = Blocking.register(GUARD, Guards.blocking);

    static more(): boolean
    {
        return Creep.ofKind(GUARD).length < Flag.ofKind(GUARD).length;
    }

    static run(): void
    {
        Guards.assign();
        Guards.guard();
    }

    private static assign(): void
    {
        const guards: Array<Creep> = Creep.ofKind(GUARD).filter(g => g.idle);

        if (guards.length == 0) return;

        Matcher.assign(guards, Guards.collectTargets(), Guards.targetValue, Guards.guardValue);
    }

    private static collectTargets(): Array<Assignable>
    {
        return Flag.ofKind(GUARD).filter(f => f.assignees.size == 0);
    }

    private static targetValue(guard: Creep, target: Assignable): number
    {
        return 1.0 / Paths.cost(guard.pos, target.pos, 0, PATH_COST_OFFSET);
    }

    private static guardValue(target: Assignable, guard: Creep): number
    {
        return 1.0 / Paths.cost(guard.pos, target.pos, 0, PATH_COST_OFFSET);
    }

    private static guard(): void
    {
        for (let guard of Creep.ofKind(GUARD))
        {
            const flag: Opt<Flag> = Targets.flag(guard.target);

            if (flag === undefined) continue;
            if (guard.pos.isEqualTo(flag.pos)) continue;

            guard.travelTo(flag.pos, 0);
        }
    }

    private static blocking(guard: Creep): boolean
    {
        const target: Opt<Assignable> = guard.target;

        return target !== undefined && guard.pos.isEqualTo(target.pos);
    }
}