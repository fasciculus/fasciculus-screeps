
declare global
{
    interface Array<T>
    {
        append(values: Array<T>): number;
        take(count: number): Array<T>;

        indexBy<K>(toKey: (value: T) => K): Map<K, T>;
    }
}

export { }