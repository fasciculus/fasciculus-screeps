import { Objects } from "../es/object";
import { Assignees } from "./assign";
import { Cached } from "./cache";
import { ResourceConfig, ScreepsConfig } from "./config";
import { Paths } from "./path";

export class Resources
{
    private static _known: Cached<Map<ResourceId, Resource>> = Cached.simple(Resources.fetchKnown);
    private static _safe: Cached<Map<ResourceId, Resource>> = Cached.simple(Resources.fetchSafe);

    private static _targets: Cached<Array<Assignable>> = Cached.simple(Resources.fetchTargets);
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

    private static fetchTargets(): Array<Assignable>
    {
        const result: Array<Assignable> = new Array();
        const config: ResourceConfig = ScreepsConfig.resource;

        if (config.hasTarget(STRUCTURE_SPAWN)) result.append(StructureSpawn.my);

        return result;
    }

    private static fetchCost(resource: Resource): Opt<number>
    {
        const targets: Array<Assignable> = Resources._targets.value;

        if (targets.length == 0) return undefined;

        Paths.sort(resource.pos, targets, 1);

        const target: Assignable = targets[0];

        return Paths.optCost(resource.pos, target.pos, 1);
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

    private static assignees(this: Resource): Set<CreepId> { return Assignees.assignees(this.id); }
    private static assignedCreeps(this: Resource): Array<Creep> { return Game.all(this.assignees); }
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
            "assignees": Objects.getter(Resources.assignees),
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