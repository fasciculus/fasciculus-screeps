
export interface Match<L, R>
{
    readonly left: L;
    readonly right: R;
}

export type MatcherLeftValue<L, R> = (right: R, left: L) => number;
export type MatcherRightValue<L, R> = (left: L, right: R) => number;

export class Matcher<L, R>
{
    private readonly lefts: Array<L>;
    private readonly rights: Array<R>;
    private readonly fnLeftValue: MatcherLeftValue<L, R>;
    private readonly fnRightValue: MatcherRightValue<L, R>;

    private readonly leftValues: Array<Array<number>> = new Array();
    private readonly rightValues: Array<Array<number>> = new Array();

    private readonly leftPrefs: Array<Array<number>> = new Array();
    private readonly rightPrefs: Array<Array<number>> = new Array();

    constructor(lefts: Array<L>, rights: Array<R>,
        fnRightValue: MatcherRightValue<L, R>, fnLeftValue: MatcherLeftValue<L, R>)
    {
        this.lefts = lefts;
        this.rights = rights;
        this.fnLeftValue = fnLeftValue;
        this.fnRightValue = fnRightValue;
    }

    private findMatches(): Array<Match<L, R>>
    {
        const leftsLength: number = this.lefts.length;
        const rightsLength: number = this.rights.length;

        if (leftsLength == 0 || rightsLength == 0) return new Array();
        if (leftsLength == 1 && rightsLength == 1) return this.singleMatch();

        this.populateValues();
        this.populatePrefs();

        return leftsLength < rightsLength ? this.findLeftMatches() : this.findRightMatches();
    }

    private findLeftMatches(): Array<Match<L, R>>
    {
        const leftsLength = this.lefts.length;
        const rightsLength = this.rights.length;
        const leftValues = this.leftValues;
        const leftPrefs = this.leftPrefs;
        const positions: Array<number> = new Array();
        const leftMatches: Array<number> = new Array();
        const rightMatches: Array<number> = new Array();

        positions.length = leftsLength;
        positions.fill(0);

        leftMatches.length = leftsLength;
        leftMatches.fill(-1);

        rightMatches.length = rightsLength;
        rightMatches.fill(-1);

        for (let iteration = 0; iteration < 5; ++iteration)
        {
            var changed: boolean = false;

            for (let i = 0; i < leftsLength; ++i)
            {
                if (leftMatches[i] >= 0) continue;

                const pos = positions[i];

                if (pos == rightsLength) continue;

                ++positions[i];

                const j = leftPrefs[i][pos];
                const ie = rightMatches[j];

                if (ie == -1)
                {
                    leftMatches[i] = j;
                    rightMatches[j] = i;
                    changed = true;
                    continue;
                }

                if (leftValues[i] > leftValues[ie])
                {
                    leftMatches[i] = j;
                    rightMatches[j] = i;
                    leftMatches[ie] = -1;
                    changed = true;
                }
            }

            if (!changed) break;
        }

        return this.createMatches(leftMatches);
    }

    private findRightMatches(): Array<Match<L, R>>
    {
        const leftsLength = this.lefts.length;
        const rightsLength = this.rights.length;
        const rightValues = this.rightValues;
        const rightPrefs = this.rightPrefs;
        const positions: Array<number> = new Array();
        const leftMatches: Array<number> = new Array();
        const rightMatches: Array<number> = new Array();

        positions.length = rightsLength;
        positions.fill(0);

        leftMatches.length = leftsLength;
        leftMatches.fill(-1);

        rightMatches.length = rightsLength;
        rightMatches.fill(-1);

        for (let iteration = 0; iteration < 5; ++iteration)
        {
            var changed: boolean = false;

            for (let j = 0; j < rightsLength; ++j)
            {
                if (rightMatches[j] >= 0) continue;

                const pos = positions[j];

                if (pos == leftsLength) continue;

                ++positions[j];

                const i = rightPrefs[j][pos];
                const je = leftMatches[i];

                if (je == -1)
                {
                    leftMatches[i] = j;
                    rightMatches[j] = i;
                    changed = true;
                    continue;
                }

                if (rightValues[j] > rightValues[je])
                {
                    leftMatches[i] = j;
                    rightMatches[j] = i;
                    rightMatches[je] = -1;
                    changed = true;
                }
            }

            if (!changed) break;
        }

        return this.createMatches(leftMatches);
    }

    private createMatches(leftMatches: Array<number>): Array<Match<L, R>>
    {
        const lefts = this.lefts;
        const rights = this.rights;
        const result: Array<Match<L, R>> = new Array();

        for (let i = 0, n = leftMatches.length; i < n; ++i)
        {
            const match = leftMatches[i];

            if (match < 0) continue;

            result.push({ left: lefts[i], right: rights[match] });
        }

        return result;
    }

    private populateValues(): void
    {
        const lefts = this.lefts;
        const rights = this.rights;
        const fnLeftValue = this.fnLeftValue;
        const fnRightValue = this.fnRightValue;
        const leftValues = this.leftValues;
        const rightValues = this.rightValues;

        for (let i = 0, n = lefts.length; i < n; ++i)
        {
            const values: Array<number> = new Array();
            const left: L = lefts[i];

            for (let j = 0, m = rights.length; j < m; ++j)
            {
                values.push(fnRightValue(left, rights[j]));
            }

            rightValues.push(values);
        }

        for (let j = 0, m = rights.length; j < m; ++j)
        {
            const values: Array<number> = new Array();
            const right: R = rights[j];

            for (let i = 0, n = lefts.length; i < n; ++i)
            {
                values.push(fnLeftValue(right, lefts[i]));
            }

            leftValues.push(values);
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
        const lefts = this.lefts;
        const rights = this.rights;
        const leftsLength = lefts.length;
        const rightsLength = rights.length;
        const leftValues = this.leftValues;
        const rightValues = this.rightValues;
        const leftPrefs = this.leftPrefs;
        const rightPrefs = this.rightPrefs;

        for (let i = 0; i < leftsLength; ++i)
        {
            const prefs = Matcher.createPrefs(rightsLength);
            const values = rightValues[i];

            prefs.sort((a, b) => values[b] - values[a]);
            leftPrefs.push(prefs);
        }

        for (let j = 0; j < rightsLength; ++j)
        {
            const prefs = Matcher.createPrefs(leftsLength);
            const values = leftValues[j];

            prefs.sort((a, b) => values[b] - values[a]);
            rightPrefs.push(prefs);
        }
    }

    private singleMatch(): Array<Match<L, R>>
    {
        const match: Match<L, R> = { left: this.lefts[0], right: this.rights[0] };

        return new Array(match);
    }

    static match<L, R>(lefts: Array<L>, rights: Array<R>,
        fnRightValue: MatcherRightValue<L, R>, fnLeftValue: MatcherLeftValue<L, R>): Array<Match<L, R>>
    {
        const matcher: Matcher<L, R> = new Matcher(lefts, rights, fnRightValue, fnLeftValue);

        return matcher.findMatches();
    }
}