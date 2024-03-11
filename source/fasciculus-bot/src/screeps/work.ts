import { Cached } from "./cache";
import { ScreepsConfig, WorkConfig } from "./config";

export class Works
{
    private static _workers: Cached<Array<Creep>> = Cached.simple(Works.fetchWorkers);

    private static fetchWorkers(): Array<Creep>
    {
        const config: WorkConfig = ScreepsConfig.work;

        return Creep.my.filter(c => config.isWorker(c));
    }

    static get workers(): Array<Creep>
    {
        return Works._workers.value;
    }
}