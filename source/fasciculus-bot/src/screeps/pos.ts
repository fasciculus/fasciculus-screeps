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

    private static forEachAtRange(this: RoomPosition, range: number, fn: (x: number, y: number) => void): void
    {
        const px: number = this.x;
        const py: number = this.y;
        const x0: number = px - range;
        const x1: number = px + range;
        const y0: number = py - range;
        const y1: number = py + range;
        const xs: number = Math.max(0, x0);
        const xe: number = Math.min(50, x1 + 1);
        const ys: number = Math.max(0, y0 + 1);
        const ye: number = Math.min(50, y1);

        if (y0 >= 0)
        {
            for (let x = xs; x < xe; ++x)
            {
                fn(x, y0);
            }
        }

        if (x0 >= 0)
        {
            for (let y = ys; y < ye; ++y)
            {
                fn(x0, y);
            }
        }

        if (x1 < 50)
        {
            for (let y = ys; y < ye; ++y)
            {
                fn(x1, y);
            }
        }

        if (y1 < 50)
        {
            for (let x = xs; x < xe; ++x)
            {
                fn(x, y1);
            }
        }
    }

    private static _instanceProperties: any =
        {
            "forEachAround": Objects.function(RoomPositions.forEachAround),
            "forEachAtRange": Objects.function(RoomPositions.forEachAtRange),
        };

    static setup()
    {
        Object.defineProperties(RoomPosition.prototype, RoomPositions._instanceProperties);
    }
}