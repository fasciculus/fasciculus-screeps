import { Cached } from "./cache";
import { ScreepsConfig, VisualConfig } from "./config";
import { Paths } from "./path";

export class Visuals
{
    private static _visuals: Cached<Map<string, RoomVisual>> = Cached.simple(() => new Map());

    private static _controllerSlotsStyle: TextStyle = { font: 0.35, color: "#ffffff", align: "center", stroke: "#000000" };

    private static _pathStyle: LineStyle = { width: 0.035, lineStyle: "dashed", opacity: 0.25 };

    private static _resourceAssignmentStyle: TextStyle = { font: 0.35, color: "#ffc000", align: "center", stroke: "#000000" };
    private static _resourceAmountStyle: TextStyle = { font: 0.35, color: "#ffff00", align: "center", stroke: "#000000" };

    private static _sourceSlotsStyle: TextStyle = { font: 0.35, color: "#ffffff", align: "center", stroke: "#000000" };

    private static _spawnTransportStyle: TextStyle = { font: 0.5, color: "#c08000", align: "center", stroke: "#000000" };

    static paint(): void
    {
        const config: VisualConfig = ScreepsConfig.visual;

        if (config.controllers) Visuals.paintControllers();
        if (config.paths) Visuals.paintPaths();
        if (config.resources) Visuals.paintResources();
        if (config.sources) Visuals.paintSources();
        if (config.spawns) Visuals.paintSpawns();
    }

    static paintPaths(): void
    {
        Paths.forEach(Visuals.paintPath);
    }

    private static paintControllers(): void
    {
        for (let controller of StructureController.my)
        {
            const pos: RoomPosition = controller.pos;
            const x: number = pos.x;
            const y: number = pos.y;
            const visual = Visuals.getVisual(pos.roomName);
            const slots: string = `${controller.slotsFree} / ${controller.slotsCount}`;

            visual.text(slots, x, y, Visuals._controllerSlotsStyle);
        }
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

    static paintResources(): void
    {
        for (let resource of Resource.known)
        {
            const pos: RoomPosition = resource.pos;
            const x: number = pos.x;
            const y: number = pos.y;
            const visual = Visuals.getVisual(pos.roomName);
            const assignment: string = `${resource.transportersAssigned} / ${resource.transportersRequired.toFixed(1)}`;
            const amount: string = `${resource.amount}`;

            visual.text(assignment, x, y - 0.10, Visuals._resourceAssignmentStyle);
            visual.text(amount, x, y + 0.35, Visuals._resourceAmountStyle);
        }
    }

    static paintSources(): void
    {
        for (let source of Source.safe)
        {
            const pos: RoomPosition = source.pos;
            const x: number = pos.x;
            const y: number = pos.y;
            const visual = Visuals.getVisual(pos.roomName);
            const slots: string = `${source.slotsFree} / ${source.slotsCount}`;

            visual.text(slots, x, y, Visuals._sourceSlotsStyle);
        }
    }

    static paintSpawns(): void
    {
        for (let spawn of StructureSpawn.my)
        {
            const pos: RoomPosition = spawn.pos;
            const x: number = pos.x;
            const y: number = pos.y;
            const visual = Visuals.getVisual(pos.roomName);
            const transport: string = `${spawn.transportersAssigned} / ${spawn.transportersRequired.toFixed(1)}`;

            visual.text(transport, x, y - 0.10, Visuals._spawnTransportStyle);
        }
    }

    private static getVisual(roomName: string): RoomVisual
    {
        return Visuals._visuals.value.ensure(roomName, (n) => new RoomVisual(n));
    }
}