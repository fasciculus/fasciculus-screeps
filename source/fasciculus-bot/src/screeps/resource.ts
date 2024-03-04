import { Objects } from "../es/object";
import { Assignees } from "./assign";
import { Cached } from "./cache";
import { ScreepsConfig } from "./config";
import { PathResult } from "./path";
import { TRANSPORTER_DIVISOR, Transports } from "./transport";

class ResourceCosts
{
    private static _fetched: Cached<Set<ResourceId>> = Cached.simple(() => new Set());
    private static _costs: Cached<Map<ResourceId, number>> = Cached.simple(() => new Map());

    static cost(resource: Resource): Opt<number>
    {
        const id: ResourceId = resource.id;
        const fetched: Set<ResourceId> = ResourceCosts._fetched.value;
        const costs: Map<ResourceId, number> = ResourceCosts._costs.value;

        if (!fetched.has(id))
        {
            const closest: Opt<PathResult<Assignable>> = Transports.closestGoal(resource);

            if (closest !== undefined)
            {
                costs.set(id, closest.cost);
            }

            fetched.add(id);
        }

        return costs.get(id);
    }
}

export class Resources
{
    private static _known: Cached<Map<ResourceId, Resource>> = Cached.simple(Resources.fetchKnown);
    private static _safe: Cached<Map<ResourceId, Resource>> = Cached.simple(Resources.fetchSafe);

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

    private static safe(this: Resource): boolean
    {
        return Resources._safe.value.has(this.id);
    }

    private static transportersAssigned(this: Resource): number
    {
        return Transports.assigned(this);
    }

    private static transportersRequired(this: Resource): number
    {
        const cost: Opt<number> = ResourceCosts.cost(this);

        if (cost === undefined) return 0;

        const speed: number = Transports.speed;
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
            "safe": Objects.getter(Resources.safe),
            "transportersAssigned": Objects.getter(Resources.transportersAssigned),
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