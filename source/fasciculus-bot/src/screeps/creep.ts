import { Objects } from "../es/object";
import { Assignees } from "./assign";
import { Blocking } from "./block";
import { BodyInfos } from "./body";
import { Cached } from "./cache";
import { Names } from "./name";
import { Paths } from "./path";
import { Targets } from "./target";

export class Creeps
{
    private static _my: Cached<Map<CreepId, Creep>> = Cached.simple(Creeps.fetchMy);
    private static _ofKind: Cached<Map<string, Array<Creep>>> = Cached.simple(Creeps.fetchOfKind);

    private static fetchMy(): Map<CreepId, Creep>
    {
        return Objects.values(Game.creeps).indexBy(c => c.id);
    }

    private static fetchOfKind(): Map<string, Array<Creep>>
    {
        return Creeps._my.value.data.groupBy(c => c.kind);
    }

    private static kind(this: Creep): string
    {
        return Names.kind(this.name);
    }

    private static getTarget(this: Creep): Opt<Assignable>
    {
        return Targets.getTarget(this);
    }

    private static setTarget(this: Creep, value: Opt<Assignable>): void
    {
        if (this.kind == "X")
        {
            const oldTarget: Opt<Assignable> = this.target;
            const oldTargetText: string = oldTarget === undefined ? "undefined" : oldTarget.id;
            const newTargetText: string = value === undefined ? "undefined" : value.id;

            console.log(`${Game.time}: ${this.name}: ${oldTargetText} -> ${newTargetText}`);
        }

        Targets.setTarget(this, value);
    }

    private static idle(this: Creep): boolean
    {
        return Targets.isIdle(this);
    }

    private static blocking(this: Creep): boolean
    {
        return Blocking.blocking(this);
    }

    private static carryParts(this: Creep): number
    {
        return BodyInfos.carryParts(this);
    }

    private static workParts(this: Creep): number
    {
        return BodyInfos.workParts(this);
    }

    private static travelTo(this: Creep, goal: RoomPosition, range: number): CreepMoveReturnCode | ERR_NO_PATH
    {
        if (this.fatigue > 0) return ERR_TIRED;

        const direction: Opt<DirectionConstant> = Paths.direction(this.pos, goal, range);

        return direction !== undefined ? this.move(direction) : ERR_NO_PATH;
    }

    private static assignedCount(this: Creep): number { return Assignees.assignedCount(this.id); }
    private static assignedCreeps(this: Creep): Array<Creep> { return Assignees.assignedCreeps(this.id); }
    private static assign(this: Creep, creep: CreepId): void { Assignees.assign(this.id, creep); }
    private static unassign(this: Creep, creep: CreepId): void { Assignees.unassign(this.id, creep); }
    private static unassignAll(this: Creep): void { Assignees.unassignAll(this.id); }

    private static my(): Array<Creep>
    {
        return Creeps._my.value.data;
    }

    private static ofKind(kind: string): Array<Creep>
    {
        var result: Opt<Array<Creep>> = Creeps._ofKind.value.get(kind);

        if (result === undefined) return new Array();

        return result;
    }

    private static _instanceProperties: any =
        {
            "kind": Objects.getter(Creeps.kind),
            "target": Objects.property(Creeps.getTarget, Creeps.setTarget),
            "idle": Objects.getter(Creeps.idle),
            "blocking": Objects.getter(Creeps.blocking),
            "carryParts": Objects.getter(Creeps.carryParts),
            "workParts": Objects.getter(Creeps.workParts),
            "travelTo": Objects.function(Creeps.travelTo),
            "assignedCount": Objects.getter(Creeps.assignedCount),
            "assignedCreeps": Objects.getter(Creeps.assignedCreeps),
            "assign": Objects.function(Creeps.assign),
            "unassign": Objects.function(Creeps.unassign),
            "unassignAll": Objects.function(Creeps.unassignAll),
        };

    private static _classProperties: any =
        {
            "my": Objects.getter(Creeps.my),
            "ofKind": Objects.function(Creeps.ofKind),
        };

    static setup()
    {
        Object.defineProperties(Creep.prototype, Creeps._instanceProperties);
        Object.defineProperties(Creep, Creeps._classProperties);
    }
}