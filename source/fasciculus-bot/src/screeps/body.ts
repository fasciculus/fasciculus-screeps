
type BodyChunk = { cost: number; parts: Array<BodyPartConstant>; };

export class BodyTemplate
{
    private static _templates: Map<string, BodyTemplate> = new Map();
    private static _minCost: number = 999999;

    private _chunks: Array<BodyChunk> = new Array();

    private static _priorities: { [part: string]: number } =
        {
            "tough": 1,
            "work": 2,
            "attack": 3,
            "ranged_attack": 4,
            "carry": 5,
            "move": 6,
            "heal": 7,
            "claim": 8
        };

    private static compare(a: BodyPartConstant, b: BodyPartConstant)
    {
        let pa: number = BodyTemplate._priorities[a] || 99;
        let pb: number = BodyTemplate._priorities[b] || 99;

        return pa - pb;
    }

    private chunkCount(energy: number): number
    {
        var result: number = 0;

        for (let chunk of this._chunks)
        {
            if (energy < chunk.cost) break;

            ++result;
            energy -= chunk.cost;
        }

        return result;
    }

    createBody(energy: number): Opt<Array<BodyPartConstant>>
    {
        const chunkCount: number = this.chunkCount(energy);

        if (chunkCount == 0) return undefined;

        return Array.flatten(this._chunks.take(chunkCount).map(c => c.parts)).sort(BodyTemplate.compare)
    }

    wait(currentEnergy: number, maxEnergy: number): boolean
    {
        const count1: number = this.chunkCount(currentEnergy);
        const count2: number = this.chunkCount(maxEnergy);

        return count1 < count2;
    }

    add(times: number, ...parts: Array<BodyPartConstant>): BodyTemplate
    {
        const cost = BodyTemplate.cost(parts);
        const chunk: BodyChunk = { cost, parts };

        for (var i = 0; i < times; ++i)
        {
            this._chunks.push(chunk);
        }

        return this;
    }

    private static cost(parts: Array<BodyPartConstant>): number
    {
        var result: number = 0;

        parts.forEach(p => { result += BODYPART_COST[p]; });

        return result;
    }

    static createTemplate(kind: string, times: number, ...parts: Array<BodyPartConstant>): BodyTemplate
    {
        const template = new BodyTemplate().add(times, ...parts);

        BodyTemplate._templates.set(kind, template);
        BodyTemplate._minCost = Math.min(BodyTemplate._minCost, template._chunks[0].cost);

        return template;
    }

    static get(kind: string): Opt<BodyTemplate>
    {
        return BodyTemplate._templates.get(kind);
    }

    static get minCost(): number
    {
        return BodyTemplate._minCost;
    }
}

export class BodyInfos
{
    private static _infos: Map<CreepId, BodyInfo> = new Map();

    private static createInfo(id: CreepId, hint?: Creep): BodyInfo
    {
        const creep: Opt<Creep> = hint === undefined ? Game.get(id) : undefined;

        if (creep === undefined) return { work: 0 };

        var work: number = 0;

        creep.body.forEach(d =>
        {
            switch (d.type)
            {
                case WORK: ++work; break;
            }
        });

        return { work };
    }

    static workParts(creep: Creep)
    {
        return BodyInfos._infos.ensure(creep.id, BodyInfos.createInfo, creep).work;
    }

    static cleanup()
    {
        const infos = BodyInfos._infos;

        infos.keep(Game.existing(infos.ids));
    }
}