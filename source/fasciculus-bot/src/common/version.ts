import { VERSION } from "./constant";

export class Version
{
    private static done: boolean = false;

    static run()
    {
        if (Version.done) return;

        console.log(`fasciculus.bot ${VERSION}`);
        Version.done = true;
    }
}
