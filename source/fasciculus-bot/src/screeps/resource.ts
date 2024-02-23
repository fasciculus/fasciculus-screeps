import { Objects } from "../es/object";
import { Assignees } from "./assign";
import { Cached } from "./cache";

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
        return resource.room?.safe || false;
    }

    private static safeResources(): Array<Resource>
    {
        return Resources._safe.value.data;
    }

    private static assignees(this: Resource): Set<CreepId> { return Assignees.assignees(this.id); }
    private static assignedCreeps(this: Resource): Array<Creep> { return Game.all(this.assignees); }
    private static assign(this: Resource, creep: CreepId): void { Assignees.assign(this.id, creep); }
    private static unassign(this: Resource, creep: CreepId): void { Assignees.unassign(this.id, creep); }
    private static unassignAll(this: Resource): void { Assignees.unassignAll(this.id); }

    private static _instanceProperties: any =
        {
            "assignees": Objects.getter(Resources.assignees),
            "assignedCreeps": Objects.getter(Resources.assignedCreeps),
            "assign": Objects.function(Resources.assign),
            "unassign": Objects.function(Resources.unassign),
            "unassignAll": Objects.function(Resources.unassignAll),
        };

    private static _classProperties: any =
        {
            "safe": Objects.getter(Resources.safeResources),
        };


    static setup()
    {
        Object.defineProperties(Resource.prototype, Resources._instanceProperties);
        Object.defineProperties(Resource, Resources._classProperties);
    }
}