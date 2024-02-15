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

    private static _instanceProperties: PropertyDescriptorMap =
    {
        "append": Objects.function(Arrays.append)
    }

    static setup()
    {
        Object.defineProperties(Array.prototype, Arrays._instanceProperties);
    }
}