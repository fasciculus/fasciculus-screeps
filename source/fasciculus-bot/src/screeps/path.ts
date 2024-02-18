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
    private static _paths: Cached<Map<string, PathFinderPath>> = Cached.simple(() => new Map());

    private static _noPath: PathFinderPath =
        {
            path: new Array(),
            ops: 0,
            cost: 0,
            incomplete: true
        };

    private static _opts: PathFinderOpts =
        {
            plainCost: 2,
            swampCost: 10,
            roomCallback: Matrices.get
        };

    private static findPath(key: string, hint?: PathSearch): PathFinderPath
    {
        if (!hint) return Paths._noPath;

        return PathFinder.search(hint.origin, { pos: hint.goal, range: hint.range }, Paths._opts);
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