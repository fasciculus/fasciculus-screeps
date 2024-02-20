import { Match, Matcher } from "./alg/match";
import { HARVESTER, TRANSPORTER } from "./constant";
import { BodyTemplate } from "./screeps/body";
import { Paths } from "./screeps/path";
import { Targets } from "./screeps/target";

export class Transport
{
    static readonly template = BodyTemplate.createTemplate(TRANSPORTER, 2, CARRY, MOVE);

    static more(): boolean
    {
        const transporters: number = Creep.ofKind(TRANSPORTER).length;
        const harvesters: number = Creep.ofKind(HARVESTER).length;
        const sources: number = Source.safe.length;

        return transporters < harvesters && transporters < sources;
    }

    static run(): void
    {
        Transport.assign();
        Transport.transport();
    }

    private static assign(): void
    {
        Creep.ofKind(TRANSPORTER).forEach(t => t.target = undefined);

        for (let iteration = 0; iteration < 3; ++iteration)
        {
            const transporters: Array<Creep> = Creep.ofKind(TRANSPORTER).filter(c => !c.target);

            if (transporters.length == 0) break;

            const targets: Array<Assignable> = Transport.getTargets();
            const matches: Array<Match<Creep, Assignable>> = Matcher.match(transporters, targets, Transport.targetValue, Transport.transporterValue);

            if (matches.length == 0) break;

            for (let match of matches)
            {
                match.left.target = match.right;
            }
        }
    }

    private static getTargets(): Array<Assignable>
    {
        const result: Array<Assignable> = new Array();

        result.append(Creep.ofKind(HARVESTER));
        result.append(StructureSpawn.my);

        return result;
    }

    private static targetValue(transporter: Creep, target: Assignable): number
    {
        var value: number = 0 - Paths.cost(transporter.pos, target.pos, 1) * 5;
        const harvester: Opt<Creep> = Targets.creep(target);

        if (transporter.energy == 0)
        {
            value += harvester ? harvester.energy : -999999;
        }
        else
        {
            const spawn: Opt<StructureSpawn> = Targets.spawn(target);

            if (transporter.freeEnergyCapacity == 0)
            {
                value -= harvester ? 999999 : 0;
            }

            value += spawn ? spawn.store.getFreeCapacity(RESOURCE_ENERGY) : 0;
        }

        return value;
    }

    private static transporterValue(target: Assignable, transporter: Creep): number
    {
        return 0 - Paths.cost(transporter.pos, target.pos, 1);
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

                if (harvester && harvester.energy > 0)
                {
                    harvester.transfer(transporter, RESOURCE_ENERGY);
                    continue;
                }

                const spawn: Opt<StructureSpawn> = Targets.spawn(target);

                if (spawn)
                {
                    transporter.transfer(spawn, RESOURCE_ENERGY);
                }
            }
            else
            {
                transporter.travelTo(target.pos, 1)
            }
        }
    }
}