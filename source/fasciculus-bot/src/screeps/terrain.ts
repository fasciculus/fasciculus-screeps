import { Objects } from "../es/object";
import { Cached } from "./cache";

export class Terrains
{
    private static _terrains: Cached<Map<string, RoomTerrain>> = Cached.simple(Map.empty<string, RoomTerrain>);

    private static getWalkable(x: number, y: number, terrain: RoomTerrain): number
    {
        return terrain.get(x, y) == TERRAIN_MASK_WALL ? 0 : 1;
    }

    private static walkableAround(pos: RoomPosition, range: number): number
    {
        const terrain: RoomTerrain = Terrains.ofName(pos.roomName);
        var result: number = 0;

        pos.forEachAround(range, (x, y) => result += Terrains.getWalkable(x, y, terrain))

        return result;
    }

    static ofRoom(room: Room): RoomTerrain
    {
        const terrains: Map<string, RoomTerrain> = Terrains._terrains.value;
        const name: string = room.name;
        var result: Opt<RoomTerrain> = terrains.get(name);

        if (result === undefined)
        {
            terrains.set(name, result = room.getTerrain());
        }

        return result;
    }

    static ofName(name: string): RoomTerrain
    {
        const terrains: Map<string, RoomTerrain> = Terrains._terrains.value;
        var result: Opt<RoomTerrain> = terrains.get(name);

        if (result === undefined)
        {
            terrains.set(name, result = new Room.Terrain(name))
        }

        return result;
    }

    private static _instanceProperties: any =
        {
            "walkableAround": Objects.function(Terrains.walkableAround),
        }

    static setup()
    {
        Object.defineProperties(Room.Terrain.prototype, Terrains._instanceProperties);
    }
}