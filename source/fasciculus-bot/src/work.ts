import { WORKER } from "./constant";
import { BodyTemplate } from "./screeps/body";

export class Work
{
    static template: BodyTemplate = BodyTemplate.createTemplate(WORKER, 1, WORK, CARRY, MOVE, MOVE);

    static more(): boolean
    {
        return Creep.ofKind(WORKER).length < 1;
    }
}