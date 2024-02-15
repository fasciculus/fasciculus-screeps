
export class Objects
{
    static keys(o: {} | undefined | null): Set<string>
    {
        if (o === undefined || o === null) return new Set();

        const keys = Object.keys(o);

        if (!keys || !Array.isArray(keys) || keys.length == 0) return new Set();

        return new Set(keys);
    }

    static values<T>(o: { [s: string]: T; } | ArrayLike<T> | undefined | null): Array<T>
    {
        if (o === undefined || o === null) return new Array<T>();

        const values = Object.values(o);

        if (!values || !Array.isArray(values) || values.length == 0) return new Array<T>();

        return values;
    }

    static function(fn: Function): PropertyDescriptor
    {
        const result: PropertyDescriptor =
        {
            configurable: true,
            enumerable: false,
            writable: false,
            value: fn
        };

        return result;
    }
}
