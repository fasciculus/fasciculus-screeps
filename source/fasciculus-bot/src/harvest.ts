import { HARVESTER } from "./constant";
import { BodyTemplate } from "./screeps/body";

export class Harvest
{
    static template = BodyTemplate.createTemplate(HARVESTER, 1, WORK, CARRY, MOVE)
        .add(1, WORK, MOVE)
        .add(1, WORK, CARRY, MOVE)
        .add(2, WORK, MOVE);

    static more(): boolean
    {
        return Creep.ofKind(HARVESTER).sum(c => c.workParts) < Source.safeFreeWork;
    }
}