import { Civil } from "./civ/civil";
import { Military } from "./mil/military";
import { BodyTemplate } from "./screeps/body";

export class Spawning
{
    static run()
    {
        const spawn: Opt<StructureSpawn> = StructureSpawn.best;

        if (spawn === undefined) return;
        if (spawn.roomEnergy < BodyTemplate.minCost) return;

        const kind: Opt<string> = Spawning.next();

        if (kind === undefined) return;

        Spawning.spawn(kind, spawn);
    }

    private static next(): Opt<string>
    {
        var kind: Opt<string> = Military.next();

        if (kind === undefined) kind = Civil.next();

        return kind;
    }

    private static spawn(kind: string, spawn: StructureSpawn): void
    {
        const template: Opt<BodyTemplate> = BodyTemplate.get(kind);

        if (template === undefined) return;

        const currentEnergy: number = spawn.roomEnergy;
        const maxEnergy: number = spawn.roomEnergyCapacity;

        if (template.wait(currentEnergy, maxEnergy)) return;

        const body: Opt<Array<BodyPartConstant>> = template.createBody(currentEnergy);

        if (body === undefined) return;

        spawn.spawn(kind, body);
    }
}