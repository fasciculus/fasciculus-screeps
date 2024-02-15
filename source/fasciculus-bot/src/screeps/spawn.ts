import { Objects } from "../es/object";
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

    private static spawn(this: StructureSpawn, type: string, body: Array<BodyPartConstant>): ScreepsReturnCode
    {
        const name = Names.nextCreepName(type);

        return this.spawnCreep(body, name);
    }

    private static my(): Array<StructureSpawn>
    {
        return Spawns._my.value.data;
    }

    private static idle(): Array<StructureSpawn>
    {
        return Spawns._idle.value.data;
    }

    private static _instanceProperties: any =
        {
            "spawn": Objects.function(Spawns.spawn),
        };

    private static _classProperties: any =
        {
            "my": Objects.getter(Spawns.my),
            "idle": Objects.getter(Spawns.idle),
        };

    static setup()
    {
        Object.defineProperties(StructureSpawn.prototype, Spawns._instanceProperties);
        Object.defineProperties(StructureSpawn, Spawns._classProperties);
    }
}