import { Objects } from "../es/object";
import { BodyInfos } from "./body";
import { Cached } from "./cache";
import { Names } from "./name";

export class Creeps
{
    private static _my: Cached<Map<CreepId, Creep>> = Cached.simple(Creeps.fetchMy);
    private static _ofKind: Cached<Map<string, Array<Creep>>> = Cached.simple(Creeps.fetchOfKind);

    private static _blocking: Cached<Map<CreepId, boolean>> = Cached.simple(() => new Map());

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

    private static createBlocking(id: CreepId, hint?: Creep): boolean
    {
        return false;
    }

    private static getBlocking(this: Creep): boolean
    {
        return Creeps._blocking.value.ensure(this.id, Creeps.createBlocking, this);
    }

    private static setBlocking(this: Creep, value: boolean): void
    {
        Creeps._blocking.value.set(this.id, value);
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
            "blocking": Objects.property(Creeps.getBlocking, Creeps.setBlocking),
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