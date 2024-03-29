
export const VERSION = "0.6.8";
export const SUICIDE = false;

export const INFO: string = "I";

export const GUARD: string = "G";

export const HARVESTER: string = "H";
export const TRANSPORTER: string = "T";
export const WORKER: string = "W";

export const PATH_COST_OFFSET = 3;

export const TRANSPORTER_MAX_IDLE_PERCENTAGE = 0.2;

export const WORKER_HARVESTER_RATIO = 0.5;
export const WORKER_ENERGY_SHARE = 0.25;

export const SCREEPS_OPTIONS: ScreepsOptions =
{
    transport:
    {
        speed: 1.0,
        transporters: [TRANSPORTER],

        goals:
        {
            spawns: true
        }
    },

    visual:
    {
        controllers: true,
        paths: false,
        resources: true,
        sources: true,
        spawns: true,
    },

    work:
    {
        workers: [WORKER]
    }
};
