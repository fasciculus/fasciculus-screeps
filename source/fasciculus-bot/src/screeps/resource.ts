import { Objects } from "../es/object";
import { Assignees } from "./assign";
import { Cached } from "./cache";
import { ScreepsConfig, TransportConfig } from "./config";
import { PathResult, Paths } from "./path";

export const TRANSPORTER_DIVISOR: number = 5000;

export class Resources
{
    private static _known: Cached<Map<ResourceId, Resource>> = Cached.simple(Resources.fetchKnown);
    private static _safe: Cached<Map<ResourceId, Resource>> = Cached.simple(Resources.fetchSafe);

    private static _targets: Cached<Array<Assignable>> = Cached.simple(Resources.fetchTargets);
    private static _costMap: Cached<Map<ResourceId, number>> = Cached.simple(() => new Map());
    private static _costFetched: Cached<Set<ResourceId>> = Cached.simple(() => new Set());

    private static _transporters: Cached<Array<Creep>> = Cached.simple(Resources.fetchTransporters);
    private static _avgCarryParts: Cached<number> = Cached.simple(Resources.fetchAvgCarryParts);

    private static fetchKnown(): Map<ResourceId, Resource>
    {
        return Array.flatten(Room.known.map(r => r.resources)).indexBy(r => r.id);
    }

    private static fetchSafe()
    {
        return Resources._known.value.filter(Resources.isSafe);
    }

    private static isSafe(id: ResourceId, resource: Resource): boolean
    {
        const room: Opt<Room> = resource.room;

        if (room === undefined) return false;

        return room.safe;
    }

    private static fetchTargets(): Array<Assignable>
    {
        const result: Array<Assignable> = new Array();
        const config: TransportConfig = ScreepsConfig.transport;

        if (config.goals.spawns) result.append(StructureSpawn.my);

        return result;
    }

    private static fetchCost(resource: Resource): Opt<number>
    {
        const targets: Array<Assignable> = Resources._targets.value;
        const closest: Opt<PathResult<Assignable>> = Paths.closest(resource.pos, targets, 1);

        return closest === undefined ? undefined : closest.cost;
    }

    private static fetchTransporters(): Array<Creep>
    {
        const config: TransportConfig = ScreepsConfig.transport;

        return Creep.my.filter(c => config.isTransporter(c));
    }

    private static fetchAvgCarryParts(): number
    {
        const transporters: Array<Creep> = Resources._transporters.value;
        const carryParts: number = transporters.sum(c => c.carryParts);

        return Math.max(1, carryParts / Math.max(1, transporters.length));
    }

    private static cost(this: Resource): Opt<number>
    {
        const id: ResourceId = this.id;
        const costMap: Map<ResourceId, number> = Resources._costMap.value;
        const costFetched: Set<ResourceId> = Resources._costFetched.value;

        if (!costFetched.has(id))
        {
            const cost: Opt<number> = Resources.fetchCost(this);

            costFetched.add(id);

            if (cost !== undefined)
            {
                costMap.set(id, cost);
            }
        }

        return costMap.get(id);
    }

    private static transportersRequired(this: Resource): number
    {
        const cost: Opt<number> = this.cost;

        if (cost === undefined) return 0;

        const speed: number = ScreepsConfig.transport.speed;
        const avgCarryParts: number = Resources._avgCarryParts.value;

        return Math.ceil(this.amount * cost * speed / avgCarryParts / TRANSPORTER_DIVISOR);
    }

    private static transportersFree(this: Resource): number
    {
        return Math.max(0, this.transportersRequired - this.assignedCount);
    }

    private static assignedCount(this: Resource): number { return Assignees.assignedCount(this.id); }
    private static assignedCreeps(this: Resource): Array<Creep> { return Assignees.assignedCreeps(this.id); }
    private static assign(this: Resource, creep: CreepId): void { Assignees.assign(this.id, creep); }
    private static unassign(this: Resource, creep: CreepId): void { Assignees.unassign(this.id, creep); }
    private static unassignAll(this: Resource): void { Assignees.unassignAll(this.id); }

    private static knownResources(): Array<Resource>
    {
        return Resources._known.value.data;
    }

    private static safeResources(): Array<Resource>
    {
        return Resources._safe.value.data;
    }

    private static _instanceProperties: any =
        {
            "cost": Objects.getter(Resources.cost),
            "transportersRequired": Objects.getter(Resources.transportersRequired),
            "transportersFree": Objects.getter(Resources.transportersFree),
            "assignedCount": Objects.getter(Resources.assignedCount),
            "assignedCreeps": Objects.getter(Resources.assignedCreeps),
            "assign": Objects.function(Resources.assign),
            "unassign": Objects.function(Resources.unassign),
            "unassignAll": Objects.function(Resources.unassignAll),
        };

    private static _classProperties: any =
        {
            "known": Objects.getter(Resources.knownResources),
            "safe": Objects.getter(Resources.safeResources),
        };


    static setup()
    {
        Object.defineProperties(Resource.prototype, Resources._instanceProperties);
        Object.defineProperties(Resource, Resources._classProperties);
    }
}