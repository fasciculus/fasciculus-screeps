import { PATH_COST_OFFSET, TRANSPORTER } from "../common/constant";
import { Matcher } from "../common/match";
import { BodyTemplate } from "../screeps/body";
import { Paths } from "../screeps/path";
import { Stores } from "../screeps/store";
import { Targets } from "../screeps/target";

const TRANSPORT_MIN_AMOUNT = 20;

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
        const resourceAmount: number = Transport.resourceAmount() / 100;
        const energyFree: number = Transport.energyFree() / 50;
        const transportersRequired: number = Math.min(resourceAmount, energyFree);

        Transport.template = transporterCount > 1 ? Transport.largeTemplate() : Transport.smallTemplate();

        return transporterCount < transportersRequired;
    }

    private static resourceAmount(): number
    {
        return Resource.safe.sum(r => r.amount >= TRANSPORT_MIN_AMOUNT ? r.amount : 0);
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

            if (target === undefined) continue;

            const resource: Opt<Resource> = Targets.resource(target);

            if (resource !== undefined)
            {
                if (Stores.energyFree(transporter) == 0 || resource.amount < TRANSPORT_MIN_AMOUNT)
                {
                    transporter.target = undefined;
                    continue;
                }

                continue;
            }

            const spawn: Opt<StructureSpawn> = Targets.spawn(target);

            if (spawn !== undefined)
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

        Matcher.assign(transporters, Transport.collectTargets(), Transport.targetValue, Transport.transporterValue);
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
            if (resource.amount < TRANSPORT_MIN_AMOUNT) continue;

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

        if (resource !== undefined) return Transport.resourceValue(transporter, resource);

        const spawn: Opt<StructureSpawn> = Targets.spawn(target);

        if (spawn !== undefined) return Transport.spawnValue(transporter, spawn);

        return -1;
    }

    private static resourceValue(transporter: Creep, resource: Resource): number
    {
        if (Stores.energyFree(transporter) == 0) return -1;
        if (resource.amount < TRANSPORT_MIN_AMOUNT) return -1;

        return resource.amount / Paths.cost(transporter.pos, resource.pos, 1, PATH_COST_OFFSET);
    }

    private static spawnValue(transporter: Creep, spawn: StructureSpawn): number
    {
        if (Stores.energy(transporter) == 0) return -1;

        const energyFree: number = Stores.energyFree(spawn);

        if (energyFree == 0) return -1;

        return energyFree / Paths.cost(transporter.pos, spawn.pos, 1, PATH_COST_OFFSET);
    }

    private static transporterValue(target: Assignable, transporter: Creep): number
    {
        return Paths.cost(transporter.pos, target.pos, 1, PATH_COST_OFFSET);
    }

    private static transport(): void
    {
        for (let transporter of Creep.ofKind(TRANSPORTER))
        {
            const target: Opt<Assignable> = transporter.target;

            if (target === undefined) continue;

            if (transporter.pos.isNearTo(target.pos))
            {
                const resource: Opt<Resource> = Targets.resource(target);

                if (resource !== undefined)
                {
                    transporter.pickup(resource);
                    continue;
                }

                const spawn: Opt<StructureSpawn> = Targets.spawn(target);

                if (spawn !== undefined)
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