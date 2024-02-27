import { Objects } from "../es/object";
import { FlagIds } from "./game";

export class Flags
{
    private static id(this: Flag): FlagId
    {
        return FlagIds.flagId(this);
    }

    private static _instanceProperties: any =
        {
            "id": Objects.getter(Flags.id),
        };

    static setup()
    {
        Object.defineProperties(Flag.prototype, Flags._instanceProperties);
    }
}