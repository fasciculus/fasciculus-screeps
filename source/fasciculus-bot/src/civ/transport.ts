import { PATH_COST_OFFSET, TRANSPORTER, TRANSPORTER_MAX_IDLE_PERCENTAGE } from "../common/constant";
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
        Transport.adjustTemplate();

        if (Transport.idlePercentage > TRANSPORTER_MAX_IDLE_PERCENTAGE) return false;

        const transporterCount: number = Creep.ofKind(TRANSPORTER).length;
        const resourceCount: number = Resource.safe.length;

        return transporterCount < (resourceCount / 2);
    }

    private static adjustTemplate(): void
    {
        Transport.template = Creep.ofKind(TRANSPORTER).length > 0 ? Transport.largeTemplate() : Transport.smallTemplate();
    }

    static get idlePercentage(): number
    {
        const all: Array<Creep> = Creep.ofKind(TRANSPORTER);
        const idle: Array<Creep> = all.filter(t => t.idle);

        return idle.length / Math.max(1, all.length);
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
                Transport.unassignResource(transporter, resource);
                continue;
            }

            const spawn: Opt<StructureSpawn> = Targets.spawn(target);

            if (spawn !== undefined)
            {
                Transport.unassignSpawn(transporter, spawn);
                continue;
            }
        }
    }

    private static unassignResource(transporter: Creep, resource: Resource): void
    {
        var unassign: boolean = false;

        unassign ||= Stores.energyFree(transporter) == 0;
        unassign ||= resource.amount < TRANSPORT_MIN_AMOUNT;

        if (unassign)
        {
            transporter.target = undefined;
        }
    }

    private static unassignSpawn(transporter: Creep, spawn: StructureSpawn): void
    {
        var unassign: boolean = false;

        unassign ||= Stores.energy(transporter) == 0;
        unassign ||= Stores.energyFree(spawn) == 0;

        if (unassign)
        {
            transporter.target = undefined;
        }
    }

    private static assign(): void
    {
        const transporters: Array<Creep> = Creep.ofKind(TRANSPORTER).filter(t => t.idle);

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
        const resources: Array<Resource> = Resource.safe.filter(r => r.amount >= TRANSPORT_MIN_AMOUNT && r.transportersFree > 0);

        result.append(resources);
    }

    private static collectSpawns(result: Array<Assignable>): void
    {
        for (let spawn of Spawn.my)
        {
            const assigned: number = spawn.assignedCreeps.filter(c => c.kind == TRANSPORTER).length;
            const count: number = Stores.energyFree(spawn) / 50 - assigned;

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

            const resource: Opt<Resource> = Targets.resource(target);

            if (resource !== undefined)
            {
                Transport.pickup(transporter, resource);
                continue;
            }

            const spawn: Opt<StructureSpawn> = Targets.spawn(target);

            if (spawn !== undefined)
            {
                Transport.transfer(transporter, spawn);
                continue;
            }
        }
    }

    private static pickup(transporter: Creep, resource: Resource): void
    {
        if (transporter.pos.isNearTo(resource.pos))
        {
            transporter.pickup(resource);
        }
        else
        {
            transporter.travelTo(resource.pos, 1)
        }
    }

    private static transfer(transporter: Creep, spawn: StructureSpawn): void
    {
        if (transporter.pos.isNearTo(spawn.pos))
        {
            transporter.transfer(spawn, RESOURCE_ENERGY)
        }
        else
        {
            transporter.travelTo(spawn.pos, 1)
        }
    }
}