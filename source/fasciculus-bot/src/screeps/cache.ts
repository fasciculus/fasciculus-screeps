
abstract class CachedBase
{
    private static _caches: Array<CachedBase> = new Array<CachedBase>();

    protected constructor()
    {
        CachedBase._caches.push(this);
    }

    abstract reset(): void;

    static cleanup(): void
    {
        CachedBase._caches.forEach(c => c.reset());
    }
}

export type ComplexCacheFetch<V> = (value: V | undefined, key: string) => V;
export type WithKeyCacheFetch<V> = (key: string) => V;
export type WithValueCacheFetch<V> = (value: V | undefined) => V;
export type SimpleCacheFetch<V> = () => V;

export class Cached<V> extends CachedBase
{
    private _fetch: ComplexCacheFetch<V>;
    private _key: string;

    private _time: number;
    private _value?: V;

    private constructor(fetch: ComplexCacheFetch<V>, key: string)
    {
        super();

        this._key = key;
        this._fetch = fetch;

        this._time = -1;
        this._value = undefined;
    }

    static complex<V>(fetch: ComplexCacheFetch<V>, key: string): Cached<V>
    {
        return new Cached<V>(fetch, key);
    }

    static withKey<V>(fetch: WithKeyCacheFetch<V>, key: string): Cached<V>
    {
        return new Cached<V>((value: V | undefined, key: string) => fetch(key), key);
    }

    static withValue<V>(fetch: WithValueCacheFetch<V>): Cached<V>
    {
        return new Cached<V>((value: V | undefined, key: string) => fetch(value), "");
    }

    static simple<V>(fetch: SimpleCacheFetch<V>): Cached<V>
    {
        return new Cached<V>((value: V | undefined, key: string) => fetch(), "");
    }

    get value(): V
    {
        const time: number = Game.time;

        if (this._value === undefined || this._time != time)
        {
            this._time = time;
            this._value = this._fetch(this._value, this._key);
        }

        return this._value;
    }

    reset()
    {
        this._time = -1;
        this._value = undefined;
    }
}