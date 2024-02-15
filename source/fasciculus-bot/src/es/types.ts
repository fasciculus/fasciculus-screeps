
declare global
{
    interface Array<T>
    {
        append(values: Array<T>): number;
        take(count: number): Array<T>;

        indexBy<K>(toKey: (value: T) => K): Map<K, T>;
        groupBy<K>(toKey: (value: T) => K): Map<K, Array<T>>;

        sum(toNumber: (value: T) => number): number;
    }

    interface ArrayConstructor
    {
        defined<T>(array: Array<T | undefined>): Array<T>;
        flatten<T>(arrays: Array<Array<T>>): Array<T>;
    }

    interface Set<T>
    {
        keep(values: Set<T>): Set<T>;

        filter(predicate: (value: T) => boolean): Set<T>;
        map<U>(fn: (key: T) => U): Array<U>;
    }
}

export { }