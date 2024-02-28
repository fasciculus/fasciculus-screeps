import { Objects } from "./object";

export class Maps
{
    private static ids<K, V>(this: Map<K, V>): Set<K>
    {
        return Set.from(this.keys());
    }

    private static data<K, V>(this: Map<K, V>): Array<V>
    {
        return Array.from(this.values());
    }

    private static keep<K, V>(this: Map<K, V>, keys: Set<K>): Map<K, V>
    {
        const toDelete: Set<K> = this.ids.filter(id => !keys.has(id));

        toDelete.forEach(id => this.delete(id));

        return this;
    }

    private static filter<K, V>(this: Map<K, V>, predicate: (key: K, value: V) => boolean): Map<K, V>
    {
        const result: Map<K, V> = new Map();

        this.forEach((v, k) => { if (predicate(k, v)) result.set(k, v); })

        return result;
    }

    private static map<K, V, U>(this: Map<K, V>, fn: (key: K, value: V) => U): Map<K, U>
    {
        const result: Map<K, U> = new Map();

        this.forEach((v, k) => result.set(k, fn(k, v)));

        return result;
    }

    private static ensure<K, V, H>(this: Map<K, V>, key: K, create: (key: K, hint?: H) => V, hint?: H): Opt<V>
    {
        var result: Opt<V> = this.get(key);

        if (result === undefined)
        {
            result = create(key, hint);

            if (result !== undefined)
            {
                this.set(key, result);
            }
        }

        return result;
    }

    private static from<V>(o: { [key: string]: V }): Map<string, V>
    {
        const result: Map<string, V> = new Map();

        for (const key in o)
        {
            result.set(key, o[key]);
        }

        return result;
    }

    private static _instanceProperties: any =
        {
            "ids": Objects.getter(Maps.ids),
            "data": Objects.getter(Maps.data),
            "keep": Objects.function(Maps.keep),
            "filter": Objects.function(Maps.filter),
            "map": Objects.function(Maps.map),
            "ensure": Objects.function(Maps.ensure),
        };

    private static _classProperties: any =
        {
            "from": Objects.function(Maps.from),
        };

    static setup()
    {
        Object.defineProperties(Map.prototype, Maps._instanceProperties);
        Object.defineProperties(Map, Maps._classProperties);
    }
}