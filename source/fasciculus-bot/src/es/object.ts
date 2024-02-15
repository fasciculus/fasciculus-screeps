
export class Objects
{
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