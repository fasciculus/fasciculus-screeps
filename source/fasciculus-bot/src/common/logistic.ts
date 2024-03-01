import { Cached } from "../screeps/cache";
import { Stores } from "../screeps/store";
import { LOGISTICS_DELIVERY_TIME, LOGISTICS_INITIAL_PERFORMANCE } from "./constant";

const LOGISTICS_DELIVERY_FACTOR: number = LOGISTICS_DELIVERY_TIME - 1;

export class Logistics
{
    private static _provided: Cached<number> = Cached.simple(Logistics.fetchProvided);
    private static _requested: Cached<number> = Cached.simple(Logistics.fetchRequested);

    private static _delivered: number = 0;
    private static _performance: number = LOGISTICS_INITIAL_PERFORMANCE;

    private static fetchProvided(): number
    {
        return Resource.safe.sum(r => r.amount);
    }

    private static fetchRequested(): number
    {
        var result: number = 0;

        result += StructureSpawn.my.sum(Logistics.getSpawnRequested);

        return result;
    }

    private static getSpawnRequested(spawn: StructureSpawn): number
    {
        if (Stores.energyFree(spawn) == 0) return 0;

        return Stores.energyCapacity(spawn) * 3;
    }

    static get provided(): number
    {
        return Logistics._provided.value;
    }

    static get requested(): number
    {
        return Logistics._requested.value;
    }

    static get available(): number
    {
        return Math.min(Logistics.provided, Logistics.requested);
    }

    static get performance(): number
    {
        return Logistics._performance;
    }

    static delivered(amount: number): void
    {
        Logistics._delivered += amount;
    }

    static setup()
    {
        if (Logistics._performance < 0.01)
        {
            Logistics._performance = LOGISTICS_INITIAL_PERFORMANCE;
        }

        Logistics._delivered = 0;
    }

    static update()
    {
        const oldPerformance = Logistics._performance;
        const curPerformance = Logistics._delivered * LOGISTICS_DELIVERY_TIME / Math.max(1, Logistics.available);

        Logistics._performance = (oldPerformance * LOGISTICS_DELIVERY_FACTOR + curPerformance) / LOGISTICS_DELIVERY_TIME;
    }
}