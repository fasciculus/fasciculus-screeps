import { Objects } from "../es/object";
import { Cached } from "./cache";

export class Controllers
{
    private static _safe: Cached<Map<ControllerId, boolean>> = Cached.simple(() => new Map());

    private static getSafe(id: ControllerId, hint?: StructureController): boolean
    {
        const controller: StructureController | undefined = hint || Game.get(id);

        if (!controller) return false;
        if (controller.my) return true;

        const reservation: ReservationDefinition | undefined = controller.reservation;

        if (!reservation) return true;

        return reservation.username == Game.username;
    }

    private static safe(this: StructureController): boolean
    {
        return Controllers._safe.value.ensure(this.id, Controllers.getSafe, this);
    }

    private static _instanceProperties: any =
        {
            "safe": Objects.getter(Controllers.safe),
        };

    static setup()
    {
        Object.defineProperties(StructureController.prototype, Controllers._instanceProperties);
    }
}