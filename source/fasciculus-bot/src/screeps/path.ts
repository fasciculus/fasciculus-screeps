import { Cached } from "./cache"
import { Matrices } from "./matrix";

interface PathSearch
{
    origin: RoomPosition;
    goal: RoomPosition;
    range: number;
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

    private static findPath(key: string, hint?: PathSearch): PathFinderPath
    {
        if (hint === undefined) return Paths.noPath();

        const origin: RoomPosition = hint.origin;
        const goal = { pos: hint.goal, range: hint.range }
        const opts: PathFinderOpts = Paths.opts(origin.roomName);

        return PathFinder.search(origin, goal, opts);
    }

    private static createKey(o: RoomPosition, g: RoomPosition, range: number): string
    {
        return o.roomName + "_" + o.x + "_" + o.y + "_" + g.roomName + "_" + g.x + "_" + g.y + "_" + range;
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
            const key: string = Paths.createKey(origin, goal, range);

            if (paths.has(key)) break;

            path = path.slice(1);
            cost = Math.max(0, cost - costDelta);

            const newPath: PathFinderPath = { path, ops, cost, incomplete: false };

            paths.set(key, newPath);
        }
    }

    private static path(origin: RoomPosition, goal: RoomPosition, range: number): PathFinderPath
    {
        const key: string = Paths.createKey(origin, goal, range);
        const hint: PathSearch = { origin, goal, range };
        const path: PathFinderPath = Paths._paths.value.ensure(key, Paths.findPath, hint);

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

        if (cost === undefined) cost = 999999;

        return cost + offset;
    }

    static sort<T extends _HasRoomPosition>(origin: RoomPosition, goals: Array<T>, range: number): Array<T>
    {
        return goals.sort((a, b) => Paths.compare(a, b, origin, range));
    }

    static compare<T extends _HasRoomPosition>(a: T, b: T, origin: RoomPosition, range: number): number
    {
        const aCost: number = Paths.cost(origin, a.pos, range, 0);
        const bCost: number = Paths.cost(origin, b.pos, range, 0);

        return aCost - bCost;
    }
}