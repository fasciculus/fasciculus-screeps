import { HARVESTER, TRANSPORTER } from "./constant";
import { BodyTemplate } from "./screeps/body";

export class Transport
{
    static readonly template = BodyTemplate.createTemplate(TRANSPORTER, 2, CARRY, MOVE);

    static more(): boolean
    {
        const transporters: number = Creep.ofKind(TRANSPORTER).length;
        const harvesters: number = Creep.ofKind(HARVESTER).length;
        const sources: number = Source.safe.length;

        return transporters < harvesters && transporters < sources;
    }
}