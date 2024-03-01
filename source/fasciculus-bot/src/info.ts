import { Transport } from "./civ/transport";
import { INFO, TRANSPORTER } from "./common/constant";
import { Logistics } from "./common/logistic";

const INFO_STYLE: TextStyle = { font:  0.7, align: "left" };

export class Infos
{
    static run()
    {
        for (let flag of Flag.ofKind(INFO))
        {
            const room: Opt<Room> = flag.room;

            if (room === undefined) continue;

            const visual: RoomVisual = room.visual;
            const pos: RoomPosition = flag.pos;
            const x: number = pos.x + 1;
            var y: number = pos.y;

            const performance: number = Logistics.performance * 100;
            const available: number = Logistics.available;

            visual.text(`T: ${performance.toFixed(0)} % of ${available}`, x, y, INFO_STYLE);
            ++y;

            const idleTransporters: number = Transport.idlePercentage * 100;
            const transporters: number = Creep.ofKind(TRANSPORTER).length;

            visual.text(`I: ${idleTransporters.toFixed(0)} % of ${transporters}`, x, y, INFO_STYLE);
            ++y;
        }
    }
}