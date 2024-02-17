import { Objects } from "../es/object";

export class RoomPositions
{
    private static forEachAround(this: RoomPosition, range: number, fn: (x: number, y: number) => void): void
    {
        const px: number = this.x;
        const py: number = this.y;
        const x0: number = Math.max(0, px - range);
        const xe: number = Math.min(50, px + range + 1);
        const y0: number = Math.max(0, py - range);
        const ye: number = Math.min(50, py + range + 1);

        for (let y = y0; y < ye; ++y)
        {
            for (let x = x0; x < xe; ++x)
            {
                if (x == px && y == py) continue;

                fn(x, y);
            }
        }
    }

    private static _instanceProperties: any =
        {
            "forEachAround": Objects.function(RoomPositions.forEachAround),
        };

    static setup()
    {
        Object.defineProperties(RoomPosition.prototype, RoomPositions._instanceProperties);
    }
}