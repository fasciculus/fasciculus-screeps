import { Objects } from "../es/object";
import { Assignees } from "./assign";

export class Sites
{
    private static assignees(this: ConstructionSite): Set<CreepId> { return Assignees.assignees(this.id); }
    private static assignedCreeps(this: ConstructionSite): Array<Creep> { return Game.all(this.assignees); }
    private static assign(this: ConstructionSite, creep: CreepId): void { Assignees.assign(this.id, creep); }
    private static unassign(this: ConstructionSite, creep: CreepId): void { Assignees.unassign(this.id, creep); }
    private static unassignAll(this: ConstructionSite): void { Assignees.unassignAll(this.id); }

    private static _instanceProperties: any =
        {
            "assignees": Objects.getter(Sites.assignees),
            "assignedCreeps": Objects.getter(Sites.assignedCreeps),
            "assign": Objects.function(Sites.assign),
            "unassign": Objects.function(Sites.unassign),
            "unassignAll": Objects.function(Sites.unassignAll),
        };

    static setup()
    {
        Object.defineProperties(StructureController.prototype, Sites._instanceProperties);
    }
}