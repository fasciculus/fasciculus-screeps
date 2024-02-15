
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
}

export { }