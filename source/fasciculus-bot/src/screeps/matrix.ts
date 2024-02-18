import { Cached } from "./cache";

export class Matrices
{
    private static _matrices: Cached<Map<string, CostMatrix>> = Cached.simple(() => new Map());

    private static createMatrix(name: string): CostMatrix
    {
        const matrix: CostMatrix = new PathFinder.CostMatrix();
        const room: Room | undefined = Room.get(name);

        if (!room) return matrix;

        return room.attacked ? Matrices.populateAttacked(room, matrix) : Matrices.populatePeaceful(room, matrix);
    }

    private static populateAttacked(room: Room, matrix: CostMatrix): CostMatrix
    {
        return Matrices.populateObstacles(room, matrix);
    }

    private static populatePeaceful(room: Room, matrix: CostMatrix): CostMatrix
    {
        return Matrices.populateObstacles(room, matrix);
    }

    private static populateObstacles(room: Room, matrix: CostMatrix): CostMatrix
    {
        room.creeps.forEach(c => Matrices.setMatrixAt(matrix, c.pos, c.blocking ? 255 : 5));
        room.obstacles.forEach(o => Matrices.setMatrixAt(matrix, o.pos, 255));

        return matrix;
    }

    private static setMatrixAt(matrix: CostMatrix, pos: RoomPosition, value: number): void
    {
        matrix.set(pos.x, pos.y, value);
    }

    static get(name: string): CostMatrix
    {
        return Matrices._matrices.value.ensure(name, Matrices.createMatrix);
    }
}