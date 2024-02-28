import { GUARD } from "../common/constant";
import { Guards } from "./guard";

export class Military
{
    static next(): Opt<string>
    {
        if (Guards.more()) return GUARD;

        return undefined;
    }

    static run()
    {
        Guards.run();
    }
}