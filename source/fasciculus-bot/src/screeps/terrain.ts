import { Objects } from "../es/object";
import { Cached } from "./cache";

export class Terrains
{
    private static _terrains: Cached<Map<string, RoomTerrain>> = Cached.simple(() => new Map());

    private static fetchTerrain(name: string): RoomTerrain
    {
        return Game.map.getRoomTerrain(name);
    }

    static get(name: string): RoomTerrain
    {
        return Terrains._terrains.value.ensure(name, Terrains.fetchTerrain);
    }

    static walkable(pos: RoomPosition, range: number): number
    {
        const terrain: RoomTerrain = Terrains.get(pos.roomName);
        var result: number = 0;

        pos.forEachAtRange(range, (x, y) => { result += Terrains.getWalkable(x, y, terrain); });

        return result;
    }

    private static getWalkable(x: number, y: number, terrain: RoomTerrain): number
    {
        return terrain.get(x, y) == TERRAIN_MASK_WALL ? 0 : 1;
    }
}