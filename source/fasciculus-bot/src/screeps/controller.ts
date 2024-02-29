import { Objects } from "../es/object";
import { Assignees } from "./assign";
import { Cached } from "./cache";

export class Controllers
{
    private static _known: Cached<Map<ControllerId, StructureController>> = Cached.simple(Controllers.fetchKnown);
    private static _my: Cached<Map<ControllerId, StructureController>> = Cached.simple(Controllers.fetchMy);
    private static _myReserved: Cached<Map<ControllerId, StructureController>> = Cached.simple(Controllers.fetchMyReserved);

    private static _slots: Map<ControllerId, number> = new Map();

    private static fetchKnown(): Map<ControllerId, StructureController>
    {
        return Array.defined(Room.known.map(r => r.controller)).indexBy(c => c.id);
    }

    private static fetchMy(): Map<ControllerId, StructureController>
    {
        return Controllers._known.value.filter((k, v) => v.my);
    }

    private static fetchMyReserved(): Map<ControllerId, StructureController>
    {
        return Controllers._known.value.filter((k, v) => Controllers.isMyReserved(v));
    }

    private static getSlots(id: ControllerId, controller: Opt<StructureController>): number
    {
        return controller !== undefined ? controller.room.terrain.walkableAtRange(controller.pos, 2) : 0;
    }

    private static safe(this: StructureController): boolean
    {
        return Controllers.isSafe(this);
    }

    private static blocked(this: StructureController): boolean
    {
        const upgradeBlocked: Opt<number> = this.upgradeBlocked;

        if (upgradeBlocked === undefined) return false;

        return upgradeBlocked > 0;
    }
    
    private static slotsCount(this: StructureController): number
    {
        return Controllers._slots.ensure(this.id, Controllers.getSlots, this);
    }

    private static slotsFree(this: StructureController): number
    {
        return this.slotsCount - this.assignees.size;
    }

    private static assignees(this: StructureController): Set<CreepId> { return Assignees.assignees(this.id); }
    private static assignedCreeps(this: StructureController): Array<Creep> { return Game.all(this.assignees); }
    private static assign(this: StructureController, creep: CreepId): void { Assignees.assign(this.id, creep); }
    private static unassign(this: StructureController, creep: CreepId): void { Assignees.unassign(this.id, creep); }
    private static unassignAll(this: StructureController): void { Assignees.unassignAll(this.id); }

    private static my(): Array<StructureController>
    {
        return Controllers._my.value.data;
    }

    private static myReserved(): Array<StructureController>
    {
        return Controllers._myReserved.value.data;
    }

    static isSafe(controller: Opt<StructureController>): boolean
    {
        if (controller === undefined) return true;
        if (controller.my) return true;

        return Controllers.isUnreserved(controller) || Controllers.isMyReserved(controller);
    }

    static isUnreserved(controller: Opt<StructureController>): boolean
    {
        if (controller === undefined) return true;
        if (controller.my) return false;

        const reservation: Opt<ReservationDefinition> = controller.reservation;

        return reservation === undefined;
    }

    static isMyReserved(controller: StructureController)
    {
        if (controller === undefined) return false;
        if (controller.my) return false;

        const reservation: Opt<ReservationDefinition> = controller.reservation;

        if (reservation === undefined) return false;

        return reservation.username == Game.username;
    }

    private static _instanceProperties: any =
        {
            "safe": Objects.getter(Controllers.safe),
            "blocked": Objects.getter(Controllers.blocked),
            "slotsCount": Objects.getter(Controllers.slotsCount),
            "slotsFree": Objects.getter(Controllers.slotsFree),
            "assignees": Objects.getter(Controllers.assignees),
            "assignedCreeps": Objects.getter(Controllers.assignedCreeps),
            "assign": Objects.function(Controllers.assign),
            "unassign": Objects.function(Controllers.unassign),
            "unassignAll": Objects.function(Controllers.unassignAll),
        };

    private static _classProperties: any =
        {
            "my": Objects.getter(Controllers.my),
            "myReserved": Objects.getter(Controllers.myReserved),
        }

    static setup()
    {
        Object.defineProperties(StructureController.prototype, Controllers._instanceProperties);
        Object.defineProperties(StructureController, Controllers._classProperties);
    }
}