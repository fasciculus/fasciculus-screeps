
export interface Match
{
    readonly creep: Creep;
    readonly target: Assignable;
}

export type MatcherCreepValue = (target: Assignable, creep: Creep) => number;
export type MatcherTargetValue = (creep: Creep, target: Assignable) => number;

export class Matcher
{
    private readonly creeps: Array<Creep>;
    private readonly targets: Array<Assignable>;
    private readonly fnCreepValue: MatcherCreepValue;
    private readonly fnTargetValue: MatcherTargetValue;

    private readonly creepValues: Array<Array<number>> = new Array();
    private readonly targetValues: Array<Array<number>> = new Array();

    private readonly creepPrefs: Array<Array<number>> = new Array();
    private readonly targetPrefs: Array<Array<number>> = new Array();

    constructor(creeps: Array<Creep>, targets: Array<Assignable>, fnTargetValue: MatcherTargetValue, fnCreepValue: MatcherCreepValue)
    {
        this.creeps = creeps;
        this.targets = targets;
        this.fnCreepValue = fnCreepValue;
        this.fnTargetValue = fnTargetValue;
    }

    private findMatches(): Array<Match>
    {
        const creepCount: number = this.creeps.length;
        const targetCount: number = this.targets.length;

        if (creepCount == 0 || targetCount == 0) return new Array();
        if (creepCount == 1 && targetCount == 1) return this.singleMatch();

        this.populateValues();
        this.populatePrefs();

        return creepCount < targetCount ? this.findCreepMatches() : this.findTargetMatches();
    }

    private findCreepMatches(): Array<Match>
    {
        const creepCount: number = this.creeps.length;
        const targetCount = this.targets.length;
        const creepValues = this.creepValues;
        const targetValues = this.targetValues;
        const creepPrefs = this.creepPrefs;
        const positions: Array<number> = new Array();
        const creepMatches: Array<number> = new Array();
        const targetMatches: Array<number> = new Array();

        positions.length = creepCount;
        positions.fill(0);

        creepMatches.length = creepCount;
        creepMatches.fill(-1);

        targetMatches.length = targetCount;
        targetMatches.fill(-1);

        for (let iteration = 0; iteration < 5; ++iteration)
        {
            var changed: boolean = false;

            for (let creep = 0; creep < creepCount; ++creep)
            {
                if (creepMatches[creep] >= 0) continue;

                const pos = positions[creep];

                if (pos == targetCount) continue;

                ++positions[creep];

                const target = creepPrefs[creep][pos];

                if (targetValues[creep][target] < 0)
                {
                    positions[creep] = targetCount;
                    continue;
                }

                const prevCreep = targetMatches[target];

                if (prevCreep == -1)
                {
                    creepMatches[creep] = target;
                    targetMatches[target] = creep;
                    changed = true;
                    continue;
                }

                if (creepValues[target][creep] > creepValues[target][prevCreep])
                {
                    creepMatches[creep] = target;
                    targetMatches[target] = creep;
                    creepMatches[prevCreep] = -1;
                    changed = true;
                }
            }

            if (!changed) return this.createMatches(creepMatches);
        }

        console.log("Matcher exhausted!");

        return this.createMatches(creepMatches);
    }

    private findTargetMatches(): Array<Match>
    {
        const creepCount: number = this.creeps.length;
        const targetCount = this.targets.length;
        const creepValues = this.creepValues;
        const targetValues = this.targetValues;
        const targetPrefs = this.targetPrefs;
        const positions: Array<number> = new Array();
        const creepMatches: Array<number> = new Array();
        const targetMatches: Array<number> = new Array();

        positions.length = targetCount;
        positions.fill(0);

        creepMatches.length = creepCount;
        creepMatches.fill(-1);

        targetMatches.length = targetCount;
        targetMatches.fill(-1);

        for (let iteration = 0; iteration < 5; ++iteration)
        {
            var changed: boolean = false;

            for (let target = 0; target < targetCount; ++target)
            {
                if (targetMatches[target] >= 0) continue;

                const pos = positions[target];

                if (pos == creepCount) continue;

                ++positions[target];

                const creep = targetPrefs[target][pos];

                if (creepValues[target][creep] < 0)
                {
                    positions[target] = creepCount;
                    continue;
                }

                const prevTarget = creepMatches[creep];

                if (prevTarget == -1)
                {
                    creepMatches[creep] = target;
                    targetMatches[target] = creep;
                    changed = true;
                    continue;
                }

                if (targetValues[creep][target] > targetValues[creep][prevTarget])
                {
                    creepMatches[creep] = target;
                    targetMatches[target] = creep;
                    targetMatches[prevTarget] = -1;
                    changed = true;
                }
            }

            if (!changed) return this.createMatches(creepMatches);
        }

        console.log("Matcher exhausted!");

        return this.createMatches(creepMatches);
    }

    private createMatches(leftMatches: Array<number>): Array<Match>
    {
        const creeps = this.creeps;
        const targets = this.targets;
        const result: Array<Match> = new Array();

        for (let creep = 0, n = leftMatches.length; creep < n; ++creep)
        {
            const match = leftMatches[creep];

            if (match < 0) continue;

            result.push({ creep: creeps[creep], target: targets[match] });
        }

        return result;
    }

    private populateValues(): void
    {
        const creeps = this.creeps;
        const targets = this.targets;
        const fnCreepValue = this.fnCreepValue;
        const fnTargetValue = this.fnTargetValue;
        const creepValues = this.creepValues;
        const targetValues = this.targetValues;

        for (let i = 0, n = creeps.length; i < n; ++i)
        {
            const values: Array<number> = new Array();
            const creep: Creep = creeps[i];
            const cache: Map<AssignableId, number> = new Map();

            for (let j = 0, m = targets.length; j < m; ++j)
            {
                const target: Assignable = targets[j];
                const targetId: AssignableId = target.id;
                var value: Opt<number> = cache.get(targetId);

                if (value === undefined)
                {
                    cache.set(targetId, value = fnTargetValue(creep, target));
                }

                values.push(value);
            }

            targetValues.push(values);
        }

        for (let j = 0, m = targets.length; j < m; ++j)
        {
            const values: Array<number> = new Array();
            const target: Assignable = targets[j];

            for (let i = 0, n = creeps.length; i < n; ++i)
            {
                values.push(fnCreepValue(target, creeps[i]));
            }

            creepValues.push(values);
        }
    }

    private static defaultPrefs: Array<number> = Matcher.forcedCreatePrefs(100);

    private static forcedCreatePrefs(count: number): Array<number>
    {
        const result: Array<number> = new Array();

        for (let i = 0; i < count; ++i)
        {
            result.push(i);
        }

        return result;
    }

    private static createPrefs(count: number): Array<number>
    {
        const defaultPrefs = Matcher.defaultPrefs;

        return count <= defaultPrefs.length ? defaultPrefs.slice(0, count) : Matcher.forcedCreatePrefs(count);
    }

    private populatePrefs(): void
    {
        const creeps = this.creeps;
        const targets = this.targets;
        const creepCount = creeps.length;
        const targetCount = targets.length;
        const creepValues = this.creepValues;
        const targetValues = this.targetValues;
        const creepPrefs = this.creepPrefs;
        const targetPrefs = this.targetPrefs;

        for (let i = 0; i < creepCount; ++i)
        {
            const prefs = Matcher.createPrefs(targetCount);
            const values = targetValues[i];

            prefs.sort((a, b) => values[b] - values[a]);
            creepPrefs.push(prefs);
        }

        for (let j = 0; j < targetCount; ++j)
        {
            const prefs = Matcher.createPrefs(creepCount);
            const values = creepValues[j];

            prefs.sort((a, b) => values[b] - values[a]);
            targetPrefs.push(prefs);
        }
    }

    private singleMatch(): Array<Match>
    {
        const match: Match = { creep: this.creeps[0], target: this.targets[0] };

        return new Array(match);
    }

    static match(creeps: Array<Creep>, targets: Array<Assignable>, fnTargetValue: MatcherTargetValue, fnCreepValue: MatcherCreepValue): Array<Match>
    {
        const matcher: Matcher = new Matcher(creeps, targets, fnTargetValue, fnCreepValue);

        return matcher.findMatches();
    }

    static assign(matches: Array<Match>): void
    {
        for (let match of matches)
        {
            match.creep.target = match.target;
        }
    }
}