import { PATH_COST_OFFSET, WORKER } from "../common/constant";
import { Matcher } from "../common/match";
import { Blocking } from "../screeps/block";
import { BodyTemplate } from "../screeps/body";
import { Paths } from "../screeps/path";
import { Stores } from "../screeps/store";
import { Targets } from "../screeps/target";

export class Work
{
    static template: BodyTemplate = BodyTemplate.createTemplate(WORKER, 1, WORK, CARRY, MOVE, MOVE);

    static readonly blockingRegistered: boolean = Blocking.register(WORKER, Work.blocking);

    static more(): boolean
    {
        return Creep.ofKind(WORKER).length < 1;
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
        }
    }

    private static unassignSpawn(worker: Creep, spawn: StructureSpawn): void
    {
        if (Stores.energyFree(worker) == 0)
        {
            worker.target = undefined;
        }
    }

    private static unassignController(worker: Creep, controller: StructureController): void
    {
        if (Stores.energy(worker) == 0)
        {
            worker.target = undefined;
        }
    }

    private static assign()
    {
        const workers: Array<Creep> = Creep.ofKind(WORKER).filter(w => !w.hasTarget);

        if (workers.length == 0) return;

        Matcher.assign(workers, Work.collectTargets(), Work.targetValue, Work.workerValue);
    }

    private static collectTargets(): Array<Assignable>
    {
        const result: Array<Assignable> = new Array();

        Work.collectSpawns(result);
        Work.collectControllers(result);

        return result;
    }

    private static collectSpawns(result: Array<Assignable>): void
    {
        result.append(Spawn.my);
    }

    private static collectControllers(result: Array<Assignable>)
    {
        result.append(StructureController.my);
    }

    private static targetValue(worker: Creep, target: Assignable): number
    {
        const spawn: Opt<StructureSpawn> = Targets.spawn(target);

        if (spawn !== undefined) return Work.spawnValue(worker, spawn);

        const controller: Opt<StructureController> = Targets.controller(target);

        if (controller !== undefined) return Work.controllerValue(worker, controller);

        return -1;
    }

    private static spawnValue(worker: Creep, spawn: StructureSpawn): number
    {
        if (Stores.energyFree(worker) == 0) return -1;

        return Stores.energy(spawn) / Paths.cost(worker.pos, spawn.pos, 1, PATH_COST_OFFSET);
    }

    private static controllerValue(worker: Creep, controller: StructureController): number
    {
        if (Stores.energy(worker) == 0) return -1;

        return 1.0 / Paths.cost(worker.pos, controller.pos, 1, PATH_COST_OFFSET);
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
        }
    }

    private static workSpawn(worker: Creep, spawn: StructureSpawn)
    {
        if (worker.pos.inRangeTo(spawn.pos, 1))
        {
            worker.withdraw(spawn, RESOURCE_ENERGY);
        }
        else
        {
            worker.travelTo(spawn.pos, 1)
        }
    }

    private static workController(worker: Creep, controller: StructureController)
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

    private static blocking(creep: Creep): boolean
    {
        const target: Opt<Assignable> = creep.target;

        return target !== undefined && creep.pos.inRangeTo(target, 2);
    }
}