import { WORKER } from "./constant";
import { Match, Matcher } from "./match";
import { BodyTemplate } from "./screeps/body";
import { Paths } from "./screeps/path";
import { Stores } from "./screeps/store";
import { Targets } from "./screeps/target";

export class Work
{
    static template: BodyTemplate = BodyTemplate.createTemplate(WORKER, 1, WORK, CARRY, MOVE, MOVE);

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
        const workers: Array<Creep> = Creep.ofKind(WORKER).filter(t => !t.hasTarget);

        if (workers.length == 0) return;

        const targets: Array<Assignable> = Work.collectTargets();
        const matches: Array<Match> = Matcher.match(workers, targets, Work.targetValue, Work.workerValue);

        Matcher.assign(matches);
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

        return Stores.energy(spawn) / Paths.logCost(worker.pos, spawn.pos, 1);
    }

    private static controllerValue(worker: Creep, controller: StructureController): number
    {
        if (Stores.energy(worker) == 0) return -1;

        return 1.0 / Paths.logCost(worker.pos, controller.pos, 1);
    }

    private static workerValue(target: Assignable, worker: Creep): number
    {
        return Paths.logCost(worker.pos, target.pos, 1);
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
}