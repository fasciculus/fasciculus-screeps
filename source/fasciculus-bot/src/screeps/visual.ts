import { Cached } from "./cache";
import { Paths } from "./path";

export class Visuals
{
    private static _visuals: Cached<Map<string, RoomVisual>> = Cached.simple(() => new Map());

    private static _pathStyle: LineStyle = { width: 0.035, lineStyle: "dashed", opacity: 0.25 };

    static paint(): void
    {
        Visuals.paintResources();
        Visuals.paintPaths();
    }

    static paintResources(): void
    {
        for (let resource of Resource.known)
        {
            const pos: RoomPosition = resource.pos;
            const visual = Visuals.getVisual(pos.roomName);
            const cost: string = `${resource.cost}`;
            const amount: string = `${resource.amount}`;
            const x: number = pos.x;
            const y: number = pos.y;

            const costStyle: TextStyle = { font: 0.35, color: "#ffffff", align: "center" };
            const amountStyle: TextStyle = { font: 0.35, color: "#ffff00", align: "center" };

            visual.text(cost, x, y + 0.00, costStyle);
            visual.text(amount, x, y + 0.35, amountStyle);
        }
    }

    static paintPaths(): void
    {
        Paths.forEach(Visuals.paintPath);
    }

    private static paintPath(origin: RoomPosition, path: Array<RoomPosition>): void
    {
        var p1: RoomPosition = origin;

        for (let i = 0, n = path.length; i < n; ++i)
        {
            const p2 = path[i];

            if (p1.roomName == p2.roomName)
            {
                const visual = Visuals.getVisual(p1.roomName);

                visual.line(p1.x, p1.y, p2.x, p2.y, Visuals._pathStyle);
            }

            p1 = p2;
        }
    }

    private static getVisual(roomName: string): RoomVisual
    {
        return Visuals._visuals.value.ensure(roomName, (n) => new RoomVisual(n));
    }
}