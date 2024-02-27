import { Harvest } from "./harvest";
import { Transport } from "./transport";
import { Work } from "./work";

export class Civilians
{
    static run(): void
    {
        Harvest.run();
        Transport.run();
        Work.run();
    }
}