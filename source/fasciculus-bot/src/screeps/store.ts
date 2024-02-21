
export class Stores
{
    static energy<T extends _HasStore>(t: T): number
    {
        return t.store.energy || 0;
    }

    static energyFree<T extends _HasStore>(t: T): number
    {
        return t.store.getFreeCapacity(RESOURCE_ENERGY);
    }
}