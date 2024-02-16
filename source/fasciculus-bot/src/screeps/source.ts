import { Objects } from "../es/object";
import { Cached } from "./cache";

export class SourceSlot
{
    private readonly _source: Cached<Source, SourceId>;

    readonly sourceId: SourceId;

    get source(): Source
    {
        return this._source.value;
    }

    constructor(source: Source)
    {
        this._source = Cached.withKey(SourceSlot.fetchSource, source.id);
        this.sourceId = source.id;
    }

    private static fetchSource(id: SourceId): Source
    {
        return Game.get(id)!;
    }
}

export class Sources
{
    private static _known: Cached<Map<SourceId, Source>> = Cached.simple(Sources.fetchKnown);
    private static _safe: Cached<Map<SourceId, Source>> = Cached.simple(Sources.fetchSafe);

    private static fetchKnown(): Map<SourceId, Source>
    {
        return Array.flatten(Room.known.map(r => r.sources)).indexBy(s => s.id);
    }

    private static isSafe(id: SourceId, source: Source)
    {
        return source.room.safe;
    }

    private static fetchSafe(): Map<SourceId, Source>
    {
        return Sources._known.value.filter(Sources.isSafe);
    }

    private static safe()
    {
        return Sources._safe.value.data;
    }

    private static _classProperties: any =
        {
            "safe": Objects.getter(Sources.safe),
        };

    static setup()
    {
        Object.defineProperties(Source, Sources._classProperties);
    }
}