import { Cached } from "./cache";

export type BlockingCallback = (creep: Creep) => boolean;

export class Blocking
{
    private static _callbacks: Map<string, BlockingCallback> = new Map();
    private static _blocking: Cached<Map<CreepId, boolean>> = Cached.simple(Map.empty<CreepId, boolean>);

    static register(kind: string, callback: BlockingCallback): boolean
    {
        Blocking._callbacks.set(kind, callback);

        return true;
    }

    private static getBlocking(id: CreepId, creep?: Creep): boolean
    {
        if (creep === undefined) return false;

        if (!creep.my) return true;

        const kind: string = creep.kind;
        const callback: Opt<BlockingCallback> = Blocking._callbacks.get(kind);

        if (callback === undefined) return false;

        return callback(creep);
    }

    static blocking(creep: Creep): boolean
    {
        return Blocking._blocking.value.ensure(creep.id, Blocking.getBlocking, creep);
    }
}