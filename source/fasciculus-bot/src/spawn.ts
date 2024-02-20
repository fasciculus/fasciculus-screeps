import { HARVESTER } from "./constant";
import { Harvest } from "./harvest";
import { BodyTemplate } from "./screeps/body";

export class Spawning
{
    static run()
    {
        const spawn: Opt<StructureSpawn> = StructureSpawn.best;

        if (!spawn) return;
        if (spawn.roomEnergy < BodyTemplate.minCost) return;

        if (Harvest.more() && Spawning.spawn(HARVESTER, spawn)) return;
    }

    private static spawn(kind: string, spawn: StructureSpawn): boolean
    {
        const template: Opt<BodyTemplate> = BodyTemplate.get(kind);

        if (!template) return false;

        const currentEnergy: number = spawn.roomEnergy;
        const maxEnergy: number = spawn.roomEnergyCapacity;

        if (template.wait(currentEnergy, maxEnergy)) return false;

        const body: Opt<Array<BodyPartConstant>> = template.createBody(currentEnergy);

        if (!body) return false;

        return spawn.spawn(kind, body) == OK;
    }
}