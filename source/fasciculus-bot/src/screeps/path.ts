import { Cached } from "./cache"
import { Matrices } from "./matrix";

interface PathKey
{
    origin: RoomPosition;
    goal: RoomPosition;
    range: number;
}

export interface PathResult<T>
{
    goal: T;
    cost: number;
}

export class Paths
{
    private static _opts: Cached<Map<string, PathFinderOpts>> = Cached.simple(() => new Map());
    private static _paths: Cached<Map<string, PathFinderPath>> = Cached.simple(() => new Map());

    private static noPath(): PathFinderPath
    {
        return {
            path: new Array(),
            ops: 0,
            cost: 0,
            incomplete: true
        };
    }

    private static createOpts(name: string): PathFinderOpts
    {
        var plainCost = 2;
        var swampCost = 10;
        const room: Opt<Room> = Room.get(name);

        if (room !== undefined && room.attacked)
        {
            plainCost = 3;
            swampCost = 15;
        }

        return { plainCost, swampCost, roomCallback: Matrices.get };
    }

    private static opts(name: string): PathFinderOpts
    {
        return Paths._opts.value.ensure(name, Paths.createOpts);
    }

    private static findPath(key: string, hint?: PathKey): PathFinderPath
    {
        if (hint === undefined) return Paths.noPath();

        const origin: RoomPosition = hint.origin;
        const goal = { pos: hint.goal, range: hint.range }
        const opts: PathFinderOpts = Paths.opts(origin.roomName);

        return PathFinder.search(origin, goal, opts);
    }

    private static encodeKey(key: PathKey): string
    {
        const o: RoomPosition = key.origin;
        const g: RoomPosition = key.goal;
        const r: number = key.range;

        return o.roomName + "_" + o.x + "_" + o.y + "_" + g.roomName + "_" + g.x + "_" + g.y + "_" + r;
    }

    private static decodeKey(encoded: string): PathKey
    {
        const parts: Array<string> = encoded.split("_");
        const originName: string = parts[0];
        const originX: number = Number.parseInt(parts[1]);
        const originY: number = Number.parseInt(parts[2]);
        const origin: RoomPosition = new RoomPosition(originX, originY, originName);
        const goalName: string = parts[3];
        const goalX: number = Number.parseInt(parts[4]);
        const goalY: number = Number.parseInt(parts[5]);
        const goal: RoomPosition = new RoomPosition(goalX, goalY, goalName);
        const range: number = Number.parseInt(parts[6]);

        return { origin, goal, range };
    }

    private static cache(goal: RoomPosition, range: number, fullPath: PathFinderPath)
    {
        if (fullPath.incomplete) return;

        const paths: Map<string, PathFinderPath> = Paths._paths.value;
        const ops: number = fullPath.ops;
        var path: Array<RoomPosition> = fullPath.path;
        var cost: number = fullPath.cost;
        var costDelta: number = cost / Math.max(1, path.length);

        while (path.length > 0)
        {
            const origin: RoomPosition = path[0];
            const key: PathKey = { origin, goal, range };
            const encoded: string = Paths.encodeKey(key);

            if (paths.has(encoded)) break;

            path = path.slice(1);
            cost = Math.max(0, cost - costDelta);

            const newPath: PathFinderPath = { path, ops, cost, incomplete: false };

            paths.set(encoded, newPath);
        }
    }

    private static path(origin: RoomPosition, goal: RoomPosition, range: number): PathFinderPath
    {
        const key: PathKey = { origin, goal, range };
        const encoded: string = Paths.encodeKey(key);
        const path: PathFinderPath = Paths._paths.value.ensure(encoded, Paths.findPath, key);

        Paths.cache(goal, range, path);

        return path;
    }

    private static dirFromTo(from: RoomPosition, to: RoomPosition): DirectionConstant
    {
        const dx = to.x - from.x;
        const dy = to.y - from.y;

        if (dx < 0) 
        {
            return dy < 0 ? TOP_LEFT : (dy > 0 ? BOTTOM_LEFT : LEFT);
        }
        else if (dx > 0)
        {
            return dy < 0 ? TOP_RIGHT : (dy > 0 ? BOTTOM_RIGHT : RIGHT);
        }
        else
        {
            return dy < 0 ? TOP : BOTTOM;
        }
    }

    static direction(origin: RoomPosition, goal: RoomPosition, range: number): Opt<DirectionConstant>
    {
        const path: PathFinderPath = Paths.path(origin, goal, range);
        const pathPath: Array<RoomPosition> = path.path;

        if (path.incomplete || pathPath.length == 0) return undefined;

        return Paths.dirFromTo(origin, pathPath[0]);
    }

    static optCost(origin: RoomPosition, goal: RoomPosition, range: number): Opt<number>
    {
        const path: PathFinderPath = Paths.path(origin, goal, range);

        return path.incomplete ? undefined : Math.max(0.1, path.cost);
    }

    static cost(origin: RoomPosition, goal: RoomPosition, range: number, offset: number): number
    {
        var cost: Opt<number> = Paths.optCost(origin, goal, range);

        if (cost === undefined) return Number.MAX_SAFE_INTEGER;;

        return cost + offset;
    }

    static closest<T extends _HasRoomPosition>(origin: RoomPosition, goals: Array<T>, range: number): Opt<PathResult<T>>
    {
        var result: Opt<PathResult<T>> = undefined;
        var bestCost: number = Number.MAX_SAFE_INTEGER;

        for (let goal of goals)
        {
            const cost: Opt<number> = Paths.optCost(origin, goal.pos, 1);

            if (cost === undefined) continue;
            if (cost > bestCost) continue;

            result = { goal, cost };
            bestCost = cost;
        }

        return result;
    }

    static forEach(fn: (origin: RoomPosition, path: Array<RoomPosition>) => void): void
    {
        Paths._paths.value.forEach((path, encodedKey) =>
        {
            const key: PathKey = Paths.decodeKey(encodedKey);

            fn(key.origin, path.path);
        });
    }
}