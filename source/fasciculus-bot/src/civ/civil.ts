import { HARVESTER, TRANSPORTER, WORKER } from "../common/constant";
import { Harvest } from "./harvest";
import { Transport } from "./transport";
import { Work } from "./work";

export class Civil
{
    static next(): Opt<string>
    {
        if (Transport.more()) return TRANSPORTER;
        if (Harvest.more()) return HARVESTER;
        if (Work.more()) return WORKER;

        return undefined;
    }

    static run(): void
    {
        Harvest.run();
        Transport.run();
        Work.run();
    }
}