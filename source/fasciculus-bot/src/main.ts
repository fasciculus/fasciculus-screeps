import { ES } from "./es/es";

ES.setup();

export const loop = function ()
{
    const a: Array<number> = Array.from([1, 2, 3]);
    const b: Array<number> = Array.from([4, 5]);

    a.append(b);
    console.log(a);
}