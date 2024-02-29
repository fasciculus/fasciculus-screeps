import { Objects } from "./object";

export class Arrays
{
    private static append<T>(this: Array<T>, values: Array<T>): number
    {
        for (const value of values)
        {
            this.push(value);
        }

        return this.length;
    }

    private static take<T>(this: Array<T>, count: number): Array<T>
    {
        return this.slice(0, Math.max(0, Math.min(count, this.length)));
    }

    private static indexBy<K, T>(this: Array<T>, toKey: (value: T) => K): Map<K, T>
    {
        const result: Map<K, T> = new Map();

        for (const value of this)
        {
            result.set(toKey(value), value);
        }

        return result;
    }

    private static groupBy<K, T>(this: Array<T>, toKey: (value: T) => K): Map<K, Array<T>>
    {
        const result: Map<K, Array<T>> = new Map();

        for (const value of this)
        {
            const key: K = toKey(value);

            result.ensure(key, () => new Array()).push(value);
        }

        return result;
    }

    private static any<T>(this: Array<T>, predicate: (value: T) => boolean): boolean
    {
        for (const value of this)
        {
            if (predicate(value)) return true;
        }

        return false;
    }

    private static sum<T>(this: Array<T>, toNumber: (value: T) => number): number
    {
        var result: number = 0;

        this.forEach(v => { result += toNumber(v); });

        return result;
    }

    private static avg<T>(this: Array<T>, toNumber: (value: T) => number): number
    {
        return this.sum(toNumber) / Math.max(1.0, this.length);
    }

    private static defined<T>(values: Array<Opt<T>>): Array<T>
    {
        var result: Array<T> = new Array<T>();

        for (const value of values)
        {
            if (value !== undefined)
            {
                result.push(value);
            }
        }

        return result;
    }

    private static flatten<T>(arrays: Array<Array<T>>): Array<T>
    {
        const result: Array<T> = new Array();

        arrays.forEach(a => result.append(a));

        return result;
    }

    private static _instanceProperties: any =
        {
            "append": Objects.function(Arrays.append),
            "take": Objects.function(Arrays.take),
            "indexBy": Objects.function(Arrays.indexBy),
            "groupBy": Objects.function(Arrays.groupBy),
            "any": Objects.function(Arrays.any),
            "sum": Objects.function(Arrays.sum),
            "avg": Objects.function(Arrays.avg),
        };

    private static _classProperties: any =
        {
            "defined": Objects.function(Arrays.defined),
            "flatten": Objects.function(Arrays.flatten),
        }

    static setup()
    {
        Object.defineProperties(Array.prototype, Arrays._instanceProperties);
        Object.defineProperties(Array, Arrays._classProperties);
    }
}