
export class Visuals
{
    static paint()
    {
        Visuals.paintResources();
    }

    static paintResources()
    {
        for (let resource of Resource.known)
        {
            const room: Opt<Room> = resource.room;

            if (room === undefined) continue;

            const visual: RoomVisual = room.visual;
            const text: string = `${resource.amount}`;
            const pos: RoomPosition = resource.pos;
            const x: number = pos.x;
            const y: number = pos.y + 0.35;
            const style: TextStyle = { font: 0.35, color: "#ffff00", align: "center" };

            visual.text(text, x, y, style);
        }
    }
}