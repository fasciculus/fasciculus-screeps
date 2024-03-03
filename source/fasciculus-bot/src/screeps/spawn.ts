import { Objects } from "../es/object";
import { Assignees } from "./assign";
import { Cached } from "./cache";
import { Names } from "./name";

export class Spawns
{
    private static _my: Cached<Map<SpawnId, StructureSpawn>> = Cached.simple(Spawns.fetchMy);
    private static _idle: Cached<Map<SpawnId, StructureSpawn>> = Cached.simple(Spawns.fetchIdle);

    private static fetchMy(): Map<SpawnId, StructureSpawn>
    {
        return Objects.values(Game.spawns).indexBy(s => s.id);
    }

    private static fetchIdle(): Map<SpawnId, StructureSpawn>
    {
        return Spawns._my.value.filter((id, spawn) => !spawn.spawning);
    }

    private static roomEnergy(this: StructureSpawn): number
    {
        return this.room.energy;
    }

    private static roomEnergyCapacity(this: StructureSpawn): number
    {
        return this.room.energyCapacity;
    }

    private static spawn(this: StructureSpawn, kind: string, body: Array<BodyPartConstant>): ScreepsReturnCode
    {
        const name = Names.nextCreepName(kind);

        return this.spawnCreep(body, name);
    }

    private static assignedCount(this: StructureSpawn): number { return Assignees.assignedCount(this.id); }
    private static assignedCreeps(this: StructureSpawn): Array<Creep> { return Assignees.assignedCreeps(this.id); }
    private static assign(this: StructureSpawn, creep: CreepId): void { Assignees.assign(this.id, creep); }
    private static unassign(this: StructureSpawn, creep: CreepId): void { Assignees.unassign(this.id, creep); }
    private static unassignAll(this: StructureSpawn): void { Assignees.unassignAll(this.id); }

    private static my(): Array<StructureSpawn>
    {
        return Spawns._my.value.data;
    }

    private static idle(): Array<StructureSpawn>
    {
        return Spawns._idle.value.data;
    }

    private static best(): Opt<StructureSpawn>
    {
        const spawns: Array<StructureSpawn> = Spawns.idle();
        const length: number = spawns.length;

        if (length == 0) return undefined;
        if (length == 1) return spawns[0];

        spawns.sort(Spawns.compare);

        return spawns[0];
    }

    private static compare(a: StructureSpawn, b: StructureSpawn): number
    {
        return b.roomEnergy - a.roomEnergy;
    }

    private static _instanceProperties: any =
        {
            "roomEnergy": Objects.getter(Spawns.roomEnergy),
            "roomEnergyCapacity": Objects.getter(Spawns.roomEnergyCapacity),
            "spawn": Objects.function(Spawns.spawn),
            "assignedCount": Objects.getter(Spawns.assignedCount),
            "assignedCreeps": Objects.getter(Spawns.assignedCreeps),
            "assign": Objects.function(Spawns.assign),
            "unassign": Objects.function(Spawns.unassign),
            "unassignAll": Objects.function(Spawns.unassignAll),
        };

    private static _classProperties: any =
        {
            "my": Objects.getter(Spawns.my),
            "idle": Objects.getter(Spawns.idle),
            "best": Objects.getter(Spawns.best),
        };

    static setup()
    {
        Object.defineProperties(StructureSpawn.prototype, Spawns._instanceProperties);
        Object.defineProperties(StructureSpawn, Spawns._classProperties);
    }
}