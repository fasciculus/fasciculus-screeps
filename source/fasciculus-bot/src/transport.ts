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
        const resourceAmount: number = Resource.safeAmount;
        const energyFree: number = Transport.energyFree();
        const transportersRequired: number = Math.min(resourceAmount, energyFree) / 100;

        Transport.template = transporterCount > 0 ? Transport.largeTemplate() : Transport.smallTemplate();

        return transporterCount < transportersRequired;
    }

    private static energyFree(): number
    {
        return Spawn.my.sum(s => Stores.energyFree(s));
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

            const resource: Opt<Resource> = Targets.resource(target);

            if (resource)
            {
                if (Stores.energyFree(transporter) == 0 || resource.amount < 10)
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

        Transport.collectResources(result);
        Transport.collectSpawns(result);

        return result;
    }

    private static collectResources(result: Array<Assignable>): void
    {
        for (let resource of Resource.safe)
        {
            const count = Math.min(3, resource.amount / 100) - resource.assignees.size;

            for (let i = 0; i < count; ++i)
            {
                result.push(resource);
            }
        }
    }

    private static collectSpawns(result: Array<Assignable>): void
    {
        for (let spawn of Spawn.my)
        {
            const count: number = Stores.energyFree(spawn) / 100;

            for (let i = 0; i < count; ++i)
            {
                result.push(spawn);
            }
        }
    }

    private static targetValue(transporter: Creep, target: Assignable): number
    {
        const resource: Opt<Resource> = Targets.resource(target);

        if (resource) return Transport.resourceValue(transporter, resource);

        const spawn: Opt<StructureSpawn> = Targets.spawn(target);

        if (spawn) return Transport.spawnValue(transporter, spawn);

        return -1;
    }

    private static resourceValue(transporter: Creep, resource: Resource): number
    {
        if (Stores.energyFree(transporter) == 0) return -1;

        return resource.amount / Paths.logCost(transporter.pos, resource.pos, 1);
    }

    private static spawnValue(transporter: Creep, spawn: StructureSpawn): number
    {
        if (Stores.energy(transporter) == 0) return -1;

        const energyFree: number = Stores.energyFree(spawn);

        if (energyFree == 0) return -1;

        return energyFree / Paths.logCost(transporter.pos, spawn.pos, 1);
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
                const resource: Opt<Resource> = Targets.resource(target);

                if (resource)
                {
                    transporter.pickup(resource);
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