import { Cached } from "./cache";
import { ScreepsConfig, VisualConfig } from "./config";
import { Paths } from "./path";

export class Visuals
{
    private static _visuals: Cached<Map<string, RoomVisual>> = Cached.simple(() => new Map());

    private static _pathStyle: LineStyle = { width: 0.035, lineStyle: "dashed", opacity: 0.25 };

    private static _resourceAssignmentStyle: TextStyle = { font: 0.35, color: "#ffc000", align: "center" };
    private static _resourceAmountStyle: TextStyle = { font: 0.35, color: "#ffff00", align: "center" };

    static paint(): void
    {
        const config: VisualConfig = ScreepsConfig.visual;

        if (config.paths) Visuals.paintPaths();
        if (config.resources) Visuals.paintResources();
    }

    static paintResources(): void
    {
        for (let resource of Resource.known)
        {
            const pos: RoomPosition = resource.pos;
            const x: number = pos.x;
            const y: number = pos.y;
            const visual = Visuals.getVisual(pos.roomName);
            const assignment: string = `${resource.assignees.size} / ${resource.transportersRequired}`;
            const amount: string = `${resource.amount}`;

            visual.text(assignment, x, y - 0.10, Visuals._resourceAssignmentStyle);
            visual.text(amount, x, y + 0.35, Visuals._resourceAmountStyle);
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