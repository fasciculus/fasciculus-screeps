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

    private static take<T>(this: Array<T>, count: number): Array<T>
    {
        return this.slice(0, Math.max(0, Math.min(count, this.length)));
    }

    private static _instanceProperties: any =
        {
            "append": Objects.function(Arrays.append),
            "take": Objects.function(Arrays.take)
        };

    static setup()
    {
        Object.defineProperties(Array.prototype, Arrays._instanceProperties);
    }
}