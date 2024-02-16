import { Objects } from "../es/object";
import { Cached } from "./cache";
import { Names } from "./name";

export class Creeps
{
    private static _my: Cached<Map<CreepId, Creep>> = Cached.simple(Creeps.fetchMy);

    private static fetchMy(): Map<CreepId, Creep>
    {
        return Objects.values(Game.creeps).indexBy(c => c.id);
    }

    private static kind(this: Creep): string
    {
        return Names.kind(this.name);
    }

    private static my(): Array<Creep>
    {
        return Creeps._my.value.data;
    }

    private static _instanceProperties: any =
        {
            "kind": Objects.getter(Creeps.kind),
        };

    private static _classProperties: any =
        {
            "my": Objects.getter(Creeps.my),
        };

    static setup()
    {
        Object.defineProperties(Creep.prototype, Creeps._instanceProperties);
        Object.defineProperties(Creep, Creeps._classProperties);
    }
}