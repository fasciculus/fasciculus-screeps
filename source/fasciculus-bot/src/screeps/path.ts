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

    private static _noPath: PathFinderPath =
        {
            path: new Array(),
            ops: 0,
            cost: 0,
            incomplete: true
        };

    private static createOpts(name: string): PathFinderOpts
    {
        var plainCost = 2;
        var swampCost = 10;
        const room: Room | undefined = Room.get(name);

        if (room && room.attacked)
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
        if (!hint) return Paths._noPath;

        const origin: RoomPosition = hint.origin;
        const goal = { pos: hint.goal, range: hint.range }
        const opts: PathFinderOpts = Paths.opts(origin.roomName);

        return PathFinder.search(origin, goal, opts);
    }

    private static createKey(o: RoomPosition, g: RoomPosition, range: number): string
    {
        return o.roomName + "_" + o.x + "_" + o.y + "_" + g.roomName + "_" + g.x + "_" + g.y + "_" + range;
    }

    static cost(origin: RoomPosition, goal: RoomPosition, range: number): number
    {
        const key: string = Paths.createKey(origin, goal, range);
        const hint: PathSearch = { origin, goal, range };
        const path: PathFinderPath = Paths._paths.value.ensure(key, Paths.findPath, hint);

        return path.incomplete ? 9999999 : path.cost;
    }
}