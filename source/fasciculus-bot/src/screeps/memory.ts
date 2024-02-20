import { Objects } from "../es/object";

export class Memories
{
    private static get<T>(key: string, initial: T): T
    {
        var result: Opt<any> = Memory[key];

        if (!result)
        {
            Memory[key] = result = initial;
        }

        return result as T;
    }

    private static _classProperties: any =
        {
            "get": Objects.function(Memories.get),
        };

    static setup()
    {
        Object.defineProperties(Memory, Memories._classProperties);
    }
}