import { Harvest } from "./civ/harvest";
import { BodyTemplate } from "./screeps/body";
import { Transport } from "./civ/transport";
import { HARVESTER, TRANSPORTER, WORKER } from "./common/constant";
import { Work } from "./civ/work";

export class Spawning
{
    static run()
    {
        const spawn: Opt<StructureSpawn> = StructureSpawn.best;

        if (spawn === undefined) return;
        if (spawn.roomEnergy < BodyTemplate.minCost) return;

        if (Transport.more() && Spawning.spawn(TRANSPORTER, spawn)) return;
        if (Harvest.more() && Spawning.spawn(HARVESTER, spawn)) return;
        if (Work.more() && Spawning.spawn(WORKER, spawn)) return;
    }

    private static spawn(kind: string, spawn: StructureSpawn): boolean
    {
        const template: Opt<BodyTemplate> = BodyTemplate.get(kind);

        if (template === undefined) return false;

        const currentEnergy: number = spawn.roomEnergy;
        const maxEnergy: number = spawn.roomEnergyCapacity;

        if (template.wait(currentEnergy, maxEnergy)) return false;

        const body: Opt<Array<BodyPartConstant>> = template.createBody(currentEnergy);

        if (body === undefined) return false;

        return spawn.spawn(kind, body) == OK;
    }
}