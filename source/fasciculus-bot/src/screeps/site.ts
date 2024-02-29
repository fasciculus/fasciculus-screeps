import { Objects } from "../es/object";
import { Assignees } from "./assign";
import { Cached } from "./cache";

export class Sites
{
    private static _my: Cached<Map<SiteId, ConstructionSite>> = Cached.simple(Sites.fetchMy);

    private static assignees(this: ConstructionSite): Set<CreepId> { return Assignees.assignees(this.id); }
    private static assignedCreeps(this: ConstructionSite): Array<Creep> { return Game.all(this.assignees); }
    private static assign(this: ConstructionSite, creep: CreepId): void { Assignees.assign(this.id, creep); }
    private static unassign(this: ConstructionSite, creep: CreepId): void { Assignees.unassign(this.id, creep); }
    private static unassignAll(this: ConstructionSite): void { Assignees.unassignAll(this.id); }

    private static fetchMy(): Map<SiteId, ConstructionSite>
    {
        return Objects.values(Game.constructionSites).indexBy(c => c.id);
    }

    private static my(): Array<ConstructionSite>
    {
        return Sites._my.value.data;
    }

    private static _instanceProperties: any =
        {
            "assignees": Objects.getter(Sites.assignees),
            "assignedCreeps": Objects.getter(Sites.assignedCreeps),
            "assign": Objects.function(Sites.assign),
            "unassign": Objects.function(Sites.unassign),
            "unassignAll": Objects.function(Sites.unassignAll),
        };

    private static _classProperties: any =
        {
            "my": Objects.getter(Sites.my),
        }

    static setup()
    {
        Object.defineProperties(ConstructionSite.prototype, Sites._instanceProperties);
        Object.defineProperties(ConstructionSite, Sites._classProperties);
    }
}