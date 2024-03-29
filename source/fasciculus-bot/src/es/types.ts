
declare global
{
    type Opt<T> = T | undefined;

    interface Array<T>
    {
        append(values: Array<T>): number;
        take(count: number): Array<T>;

        indexBy<K>(toKey: (value: T) => K): Map<K, T>;
        groupBy<K>(toKey: (value: T) => K): Map<K, Array<T>>;

        any(predicate: (value: T) => boolean): boolean;

        sum(toNumber: (value: T) => number): number;
        avg(toNumber: (value: T) => number): number;
    }

    interface ArrayConstructor
    {
        defined<T>(array: Array<Opt<T>>): Array<T>;
        flatten<T>(arrays: Array<Array<T>>): Array<T>;
    }

    interface Set<T>
    {
        addAll(values: Iterable<T>): this;

        keep(values: Set<T>): Set<T>;

        filter(predicate: (value: T) => boolean): Set<T>;
        map<U>(fn: (key: T) => U): Array<U>;
    }

    interface SetConstructor
    {
        from<T>(iterable?: Iterable<T> | null): Set<T>;
    }

    interface Map<K, V>
    {
        get ids(): Set<K>;
        get data(): Array<V>;

        keep(keys: Set<K>): Map<K, V>;

        filter(predicate: (key: K, value: V) => boolean): Map<K, V>;
        map<U>(fn: (key: K, value: V) => U): Map<K, U>;

        ensure<H>(key: K, create: (key: K, hint?: H) => V, hint?: H): V;
    }

    interface MapConstructor
    {
        from<V>(o: { [key: string]: V }): Map<string, V>;
    }
}

export { }