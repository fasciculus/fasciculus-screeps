
export class Stores
{
    static energy<T extends _HasStore>(t: T): number
    {
        const result: Opt<number> = t.store.energy;

        return result === undefined ? 0 : result;
    }

    static energyCapacity<T extends _HasStore>(t: T): number
    {
        const result: Opt<number> = t.store.getCapacity(RESOURCE_ENERGY);

        return result === undefined ? 0 : result;
    }

    static energyFree<T extends _HasStore>(t: T): number
    {
        const result: Opt<number> = t.store.getFreeCapacity(RESOURCE_ENERGY);

        return result === undefined ? 0 : result;
    }
}