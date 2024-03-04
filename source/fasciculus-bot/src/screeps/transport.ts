import { Cached } from "./cache";
import { ScreepsConfig, TransportConfig, TransportGoalsConfig } from "./config";
import { PathResult, Paths } from "./path";

export const TRANSPORTER_DIVISOR: number = 5000;

export class Transports
{
    private static _transporters: Cached<Array<Creep>> = Cached.simple(Transports.fetchTransporters);
    private static _avgCarryParts: Cached<number> = Cached.simple(Transports.fetchAvgCarryParts);

    private static _goals: Cached<Array<Assignable>> = Cached.simple(Transports.fetchGoals);

    private static _assigned: Cached<Map<AssignableId, number>> = Cached.simple(() => new Map());

    private static fetchTransporters(): Array<Creep>
    {
        const config: TransportConfig = ScreepsConfig.transport;

        return Creep.my.filter(c => config.isTransporter(c));
    }

    private static fetchAvgCarryParts(): number
    {
        const transporters: Array<Creep> = Transports._transporters.value;
        const carryParts: number = transporters.sum(c => c.carryParts);

        return carryParts / Math.max(1, transporters.length);
    }

    private static fetchGoals(): Array<Assignable>
    {
        const result: Array<Assignable> = new Array();
        const config: TransportGoalsConfig = ScreepsConfig.transport.goals;

        if (config.spawns) result.append(Spawn.my);

        return result;
    }

    private static fetchAssigned(id: AssignableId, assignable?: Assignable): number
    {
        if (assignable === undefined) return 0;

        const config: TransportConfig = ScreepsConfig.transport;

        return assignable.assignedCreeps.filter(c => config.isTransporter(c)).length;
    }

    static get speed(): number
    {
        return ScreepsConfig.transport.speed;
    }

    static get avgCarryParts(): number
    {
        return Transports._avgCarryParts.value;
    }

    static assigned(assignable: Assignable): number
    {
        return Transports._assigned.value.ensure(assignable.id, Transports.fetchAssigned, assignable);
    }

    static closestGoal<T extends _HasRoomPosition>(origin: T): Opt<PathResult<Assignable>>
    {
        const goals: Array<Assignable> = Transports._goals.value;

        return Paths.closest(origin.pos, goals, 1);
    }
}