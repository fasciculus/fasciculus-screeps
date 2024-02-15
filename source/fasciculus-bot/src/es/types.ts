
declare global
{
    interface Array<T>
    {
        append(values: Array<T>): number;
        take(count: number): Array<T>;
    }
}

export { }