import { Transport } from "../civ/transport";
import { Objects } from "../es/object";
import { Assignees } from "./assign";
import { Cached } from "./cache";
import { ScreepsConfig, TransportConfig } from "./config";
import { PathResult, Paths } from "./path";
import { TRANSPORTER_DIVISOR, Transports } from "./transport";

export class Resources
{
    private static _known: Cached<Map<ResourceId, Resource>> = Cached.simple(Resources.fetchKnown);
    private static _safe: Cached<Map<ResourceId, Resource>> = Cached.simple(Resources.fetchSafe);

    private static _costMap: Cached<Map<ResourceId, number>> = Cached.simple(() => new Map());
    private static _costFetched: Cached<Set<ResourceId>> = Cached.simple(() => new Set());

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

    private static cost(this: Resource): Opt<number>
    {
        const id: ResourceId = this.id;
        const costMap: Map<ResourceId, number> = Resources._costMap.value;
        const costFetched: Set<ResourceId> = Resources._costFetched.value;

        if (!costFetched.has(id))
        {
            const closest: Opt<PathResult<Assignable>> = Transports.closestGoal(this);

            costFetched.add(id);

            if (closest !== undefined)
            {
                costMap.set(id, closest.cost);
            }
        }

        return costMap.get(id);
    }

    private static transportersRequired(this: Resource): number
    {
        const cost: Opt<number> = this.cost;

        if (cost === undefined) return 0;

        const speed: number = ScreepsConfig.transport.speed;
        const avgCarryParts: number = Transports.avgCarryParts;

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