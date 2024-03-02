import { PATH_COST_OFFSET, WORKER, WORKER_ENERGY_SHARE } from "../common/constant";
import { Matcher } from "../common/match";
import { Blocking } from "../screeps/block";
import { BodyTemplate } from "../screeps/body";
import { Paths } from "../screeps/path";
import { Stores } from "../screeps/store";
import { Targets } from "../screeps/target";
import { Harvest } from "./harvest";

export class Work
{
    static template: BodyTemplate = BodyTemplate.createTemplate(WORKER, 1, WORK, CARRY, MOVE, MOVE);

    static readonly blockingRegistered: boolean = Blocking.register(WORKER, Work.blocking);

    static more(): boolean
    {
        if (Work.hasIdle()) return false;

        const energyUsed: number = Work.energyUsed();
        const energyAvailable: number = Work.energyAvailable();

        console.log(`${Game.time}: Work.more ${energyUsed} / ${energyAvailable}`);

        return energyUsed < energyAvailable;
    }

    private static hasIdle(): boolean
    {
        return Creep.ofKind(WORKER).any(w => w.idle);
    }

    private static energyUsed(): number
    {
        var result: number = 0;

        for (let worker of Creep.ofKind(WORKER))
        {
            const target: Opt<Assignable> = worker.target;

            if (target === undefined) continue;

            const controller: Opt<StructureController> = Targets.controller(target);

            if (controller !== undefined)
            {
                result += worker.workParts;
                continue;
            }

            const site: Opt<ConstructionSite> = Targets.site(target);

            if (site !== undefined)
            {
                result += worker.workParts;
                continue;
            }
        }

        return result;
    }

    private static energyAvailable(): number
    {
        return Harvest.energyHarvested() * WORKER_ENERGY_SHARE;
    }

    static run()
    {
        Work.unassign();
        Work.assign();
        Work.work();
    }

    private static unassign(): void
    {
        for (let worker of Creep.ofKind(WORKER))
        {
            const target: Opt<Assignable> = worker.target;

            if (target === undefined) continue;

            const spawn: Opt<StructureSpawn> = Targets.spawn(target);

            if (spawn !== undefined)
            {
                Work.unassignSpawn(worker, spawn);
                continue;
            }

            const controller: Opt<StructureController> = Targets.controller(target);

            if (controller !== undefined)
            {
                Work.unassignController(worker, controller);
                continue;
            }

            const site: Opt<ConstructionSite> = Targets.site(target);

            if (site !== undefined)
            {
                Work.unassignSite(worker, site);
                continue;
            }

            worker.target = undefined;
        }
    }

    private static unassignSpawn(worker: Creep, spawn: StructureSpawn): void
    {
        var unassign: boolean = false;

        unassign ||= Stores.energyFree(worker) == 0;
        unassign ||= Stores.energy(spawn) == 0;

        if (unassign)
        {
            worker.target = undefined;
        }
    }

    private static unassignController(worker: Creep, controller: StructureController): void
    {
        var unassign: boolean = false;

        unassign ||= controller.blocked;
        unassign ||= Stores.energy(worker) == 0;

        if (unassign)
        {
            worker.target = undefined;
        }
    }

    private static unassignSite(worker: Creep, site: ConstructionSite): void
    {
        if (Stores.energy(worker) == 0)
        {
            worker.target = undefined;
        }
    }

    private static assign()
    {
        const workers: Array<Creep> = Creep.ofKind(WORKER).filter(w => w.idle);

        if (workers.length == 0) return;

        Matcher.assign(workers, Work.collectTargets(), Work.targetValue, Work.workerValue);
    }

    private static collectTargets(): Array<Assignable>
    {
        const result: Array<Assignable> = new Array();

        Work.collectSpawns(result);
        Work.collectControllers(result);
        Work.collectSites(result);

        return result;
    }

    private static collectSpawns(result: Array<Assignable>): void
    {
        result.append(Spawn.my);
    }

    private static collectControllers(result: Array<Assignable>): void
    {
        for (let controller of StructureController.my)
        {
            const count: number = controller.slotsFree;

            for (let i = 0; i < count; ++i)
            {
                result.push(controller);
            }
        }
    }

    private static collectSites(result: Array<Assignable>): void
    {
        result.append(ConstructionSite.my);
    }

    private static targetValue(worker: Creep, target: Assignable): number
    {
        const spawn: Opt<StructureSpawn> = Targets.spawn(target);

        if (spawn !== undefined) return Work.spawnValue(worker, spawn);

        const controller: Opt<StructureController> = Targets.controller(target);

        if (controller !== undefined) return Work.controllerValue(worker, controller);

        const site: Opt<ConstructionSite> = Targets.site(target);

        if (site !== undefined) return Work.siteValue(worker, site);

        return -1;
    }

    private static spawnValue(worker: Creep, spawn: StructureSpawn): number
    {
        if (Stores.energy(worker) > 0) return -1;
        if (Stores.energyFree(worker) == 0) return -1;
        if (Stores.energy(spawn) == 0) return -1;

        return Stores.energy(spawn) / Paths.cost(worker.pos, spawn.pos, 1, PATH_COST_OFFSET);
    }

    private static controllerValue(worker: Creep, controller: StructureController): number
    {
        if (controller.blocked) return -1;
        if (Stores.energy(worker) == 0) return -1;

        return 1.0 / Paths.cost(worker.pos, controller.pos, 2, PATH_COST_OFFSET);
    }

    private static siteValue(worker: Creep, site: ConstructionSite): number
    {
        if (Stores.energy(worker) == 0) return -1;

        return 1.0 / Paths.cost(worker.pos, site.pos, 2, PATH_COST_OFFSET);
    }

    private static workerValue(target: Assignable, worker: Creep): number
    {
        return Paths.cost(worker.pos, target.pos, 1, PATH_COST_OFFSET);
    }

    private static work()
    {
        for (let worker of Creep.ofKind(WORKER))
        {
            const target: Opt<Assignable> = worker.target;

            if (target === undefined) continue;

            const spawn: Opt<StructureSpawn> = Targets.spawn(target);

            if (spawn !== undefined)
            {
                Work.workSpawn(worker, spawn);
                continue;
            }

            const controller: Opt<StructureController> = Targets.controller(target);

            if (controller !== undefined)
            {
                Work.workController(worker, controller);
                continue;
            }

            const site: Opt<ConstructionSite> = Targets.site(target);

            if (site !== undefined)
            {
                Work.workSite(worker, site);
                continue;
            }
        }
    }

    private static workSpawn(worker: Creep, spawn: StructureSpawn): void
    {
        if (worker.pos.isNearTo(spawn.pos))
        {
            worker.withdraw(spawn, RESOURCE_ENERGY);
        }
        else
        {
            worker.travelTo(spawn.pos, 1)
        }
    }

    private static workController(worker: Creep, controller: StructureController): void
    {
        if (worker.pos.inRangeTo(controller.pos, 2))
        {
            worker.upgradeController(controller);
        }
        else
        {
            worker.travelTo(controller.pos, 2);
        }
    }

    private static workSite(worker: Creep, site: ConstructionSite): void
    {
        if (worker.pos.inRangeTo(site.pos, 2))
        {
            worker.build(site);
        }
        else
        {
            worker.travelTo(site.pos, 2);
        }
    }

    private static blocking(creep: Creep): boolean
    {
        const target: Opt<Assignable> = creep.target;

        return target !== undefined && creep.pos.inRangeTo(target, 2);
    }
}