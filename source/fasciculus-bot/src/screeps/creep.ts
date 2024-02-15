import { Objects } from "../es/object";
import { Names } from "./name";

export class Creeps
{
    private static type(this: Creep): string
    {
        return Names.type(this.name);
    }

    private static _instanceProperties: any =
        {
            "type": Objects.getter(Creeps.type),
        };

    static setup()
    {
        Object.defineProperties(Creep.prototype, Creeps._instanceProperties);
    }
}