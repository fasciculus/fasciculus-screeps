import { HARVESTER, TRANSPORTER, WORKER } from "../common/constant";
import { Harvest } from "./harvest";
import { Transport } from "./transport";
import { Work } from "./work";

export class Civil
{
    static next(): Opt<string>
    {
        if (Harvest.more()) return HARVESTER;
        if (Transport.more()) return TRANSPORTER;
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