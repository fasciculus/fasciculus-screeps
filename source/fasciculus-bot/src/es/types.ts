
declare global
{
    interface Array<T>
    {
        append(values: Array<T>): number;
    }
}

export { }