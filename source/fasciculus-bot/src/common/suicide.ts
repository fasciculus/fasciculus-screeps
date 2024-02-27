import { SUICIDE } from "./constant";

export class Suicide
{
    private static done: boolean = !SUICIDE;

    static survive(): boolean
    {
        if (Suicide.done) return true;

        Creep.my.forEach(c => c.suicide());

        Suicide.done = true;

        return false;
    }
}

