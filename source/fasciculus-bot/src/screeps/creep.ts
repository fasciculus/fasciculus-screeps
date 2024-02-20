import { Objects } from "../es/object";
import { Blocking } from "./block";
import { BodyInfos } from "./body";
import { Cached } from "./cache";
import { Names } from "./name";
import { Targets } from "./target";

export class Creeps
{
    private static _my: Cached<Map<CreepId, Creep>> = Cached.simple(Creeps.fetchMy);
    private static _ofKind: Cached<Map<string, Array<Creep>>> = Cached.simple(Creeps.fetchOfKind);

    private static fetchMy(): Map<CreepId, Creep>
    {
        return Objects.values(Game.creeps).indexBy(c => c.id);
    }

    private static fetchOfKind(): Map<string, Array<Creep>>
    {
        return Creeps._my.value.data.groupBy(c => c.kind);
    }

    private static kind(this: Creep): string
    {
        return Names.kind(this.name);
    }

    private static getTarget(this: Creep): Opt<Assignable>
    {
        return Targets.getTarget(this);
    }

    private static setTarget(this: Creep, value: Opt<Assignable>): void
    {
        Targets.setTarget(this, value);
    }

    private static blocking(this: Creep): boolean
    {
        return Blocking.blocking(this);
    }

    private static workParts(this: Creep): number
    {
        return BodyInfos.workParts(this);
    }

    private static my(): Array<Creep>
    {
        return Creeps._my.value.data;
    }

    private static ofKind(kind: string): Array<Creep>
    {
        return Creeps._ofKind.value.get(kind) || new Array();
    }

    private static _instanceProperties: any =
        {
            "kind": Objects.getter(Creeps.kind),
            "target": Objects.property(Creeps.getTarget, Creeps.setTarget),
            "blocking": Objects.getter(Creeps.blocking),
            "workParts": Objects.getter(Creeps.workParts),
        };

    private static _classProperties: any =
        {
            "my": Objects.getter(Creeps.my),
            "ofKind": Objects.function(Creeps.ofKind),
        };

    static setup()
    {
        Object.defineProperties(Creep.prototype, Creeps._instanceProperties);
        Object.defineProperties(Creep, Creeps._classProperties);
    }
}