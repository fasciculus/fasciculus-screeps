import { Cached } from "./cache";

export class Terrains
{
    private static _terrains: Cached<Map<string, RoomTerrain>> = Cached.simple(() => new Map());

    static ofRoom(room: Room): RoomTerrain
    {
        const terrains: Map<string, RoomTerrain> = Terrains._terrains.value;
        const name: string = room.name;
        var result: RoomTerrain | undefined = terrains.get(name);

        if (!result)
        {
            terrains.set(name, result = room.getTerrain());
        }

        return result;
    }

    static ofName(name: string): RoomTerrain
    {
        const terrains: Map<string, RoomTerrain> = Terrains._terrains.value;
        var result: RoomTerrain | undefined = terrains.get(name);

        if (!result)
        {
            terrains.set(name, result = new Room.Terrain(name))
        }

        return result;
    }
}