import { INFO } from "./common/constant";
import { Names } from "./screeps/name";

export class W7N3
{
    static run(): void
    {
        W7N3.ensureInfoFlag();
    }

    private static ensureInfoFlag(): void
    {
        const pos: RoomPosition = new RoomPosition(38, 19, "W7N3");

        if (Flag.ofKind(INFO).any(f => f.pos.isEqualTo(pos))) return;

        const name: string = Names.nextFlagName(INFO);

        pos.createFlag(name);
    }
}