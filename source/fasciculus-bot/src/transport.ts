import { HARVESTER, TRANSPORTER } from "./constant";
import { Match, Matcher } from "./match";
import { BodyTemplate } from "./screeps/body";
import { Paths } from "./screeps/path";
import { Stores } from "./screeps/store";
import { Targets } from "./screeps/target";

export class Transport
{
    static template = Transport.smallTemplate();

    private static smallTemplate(): BodyTemplate
    {
        return BodyTemplate.createTemplate(TRANSPORTER, 1, CARRY, MOVE);
    }

    private static largeTemplate(): BodyTemplate
    {
        return BodyTemplate.createTemplate(TRANSPORTER, 2, CARRY, MOVE);
    }

    static more(): boolean
    {
        const transporterCount: number = Creep.ofKind(TRANSPORTER).length;
        const harvesterCount: number = Creep.ofKind(HARVESTER).length;
        const sourceCount: number = Source.safe.length;

        Transport.template = transporterCount > 0 ? Transport.largeTemplate() : Transport.smallTemplate();

        return transporterCount < (harvesterCount / 2) && transporterCount < sourceCount;
    }

    static run(): void
    {
        Transport.unassign();
        Transport.assign();
        Transport.transport();
    }

    private static unassign(): void
    {
        for (let transporter of Creep.ofKind(TRANSPORTER))
        {
            const target: Opt<Assignable> = transporter.target;

            if (!target) continue;

            const harvester: Opt<Creep> = Targets.creep(target);

            if (harvester)
            {
                if (Stores.energyFree(transporter) == 0)
                {
                    transporter.target = undefined;
                    continue;
                }

                const cost: Opt<number> = Paths.cost(transporter.pos, harvester.pos, 1);

                if (!cost)
                {
                    transporter.target = undefined;
                    continue;
                }

                const harvesterEnergy: number = Stores.energy(harvester);
                const futureHarvesterEnergy: number = harvesterEnergy + harvester.workParts * 2 * cost;

                if (futureHarvesterEnergy < 10)
                {
                    transporter.target = undefined;
                    continue;
                }

                continue;
            }

            const spawn: Opt<StructureSpawn> = Targets.spawn(target);

            if (spawn)
            {
                if (Stores.energy(transporter) == 0 || Stores.energyFree(spawn) == 0)
                {
                    transporter.target = undefined;
                    continue;
                }

                continue;
            }
        }
    }

    private static assign(): void
    {
        const transporters: Array<Creep> = Creep.ofKind(TRANSPORTER).filter(t => !t.hasTarget);

        if (transporters.length == 0) return;

        const targets: Array<Assignable> = Transport.collectTargets();
        const matches: Array<Match> = Matcher.match(transporters, targets, Transport.targetValue, Transport.transporterValue);

        Matcher.assign(matches);
    }

    private static collectTargets(): Array<Assignable>
    {
        const result: Array<Assignable> = new Array();

        result.append(Creep.ofKind(HARVESTER));
        result.append(StructureSpawn.my);

        return result;
    }

    private static targetValue(transporter: Creep, target: Assignable): number
    {
        const harvester: Opt<Creep> = Targets.creep(target);

        if (harvester) return Transport.harvesterValue(transporter, harvester);

        const spawn: Opt<StructureSpawn> = Targets.spawn(target);

        if (spawn) return Transport.spawnValue(transporter, spawn);

        return -1;
    }

    private static harvesterValue(transporter: Creep, harvester: Creep): number
    {
        if (Stores.energyFree(transporter) == 0) return -1;

        const harvesterEnergy = Stores.energy(harvester);

        if (harvesterEnergy < 10) return -1;

        return harvesterEnergy / Paths.logCost(transporter.pos, harvester.pos, 1);
    }

    private static spawnValue(transporter: Creep, spawn: StructureSpawn): number
    {
        if (Stores.energy(transporter) == 0) return -1;

        const energyFree: number = Stores.energyFree(spawn);

        if (energyFree == 0) return -1;

        return (energyFree / 3) / Paths.logCost(transporter.pos, spawn.pos, 1);
    }

    private static transporterValue(target: Assignable, transporter: Creep): number
    {
        return Paths.logCost(transporter.pos, target.pos, 1);
    }

    private static transport(): void
    {
        for (let transporter of Creep.ofKind(TRANSPORTER))
        {
            const target: Opt<Assignable> = transporter.target;

            if (!target) continue;

            if (transporter.pos.inRangeTo(target.pos, 1))
            {
                const harvester: Opt<Creep> = Targets.creep(target);

                if (harvester)
                {
                    harvester.transfer(transporter, RESOURCE_ENERGY);
                    continue;
                }

                const spawn: Opt<StructureSpawn> = Targets.spawn(target);

                if (spawn)
                {
                    transporter.transfer(spawn, RESOURCE_ENERGY);
                    continue;
                }
            }
            else
            {
                transporter.travelTo(target.pos, 1)
            }
        }
    }
}