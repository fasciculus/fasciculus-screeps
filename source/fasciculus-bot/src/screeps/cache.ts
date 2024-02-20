
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

export type ComplexCacheFetch<V, K = string> = (value: Opt<V>, key: K) => V;
export type WithKeyCacheFetch<V, K = string> = (key: K) => V;
export type WithValueCacheFetch<V> = (value: Opt<V>) => V;
export type SimpleCacheFetch<V> = () => V;

export class Cached<V, K = string> extends CachedBase
{
    private _fetch: ComplexCacheFetch<V, K>;
    private _key: K;

    private _time: number;
    private _value?: V;

    private constructor(fetch: ComplexCacheFetch<V, K>, key: K)
    {
        super();

        this._key = key;
        this._fetch = fetch;

        this._time = -1;
        this._value = undefined;
    }

    static complex<V, K = string>(fetch: ComplexCacheFetch<V, K>, key: K): Cached<V, K>
    {
        return new Cached<V, K>(fetch, key);
    }

    static withKey<V, K = string>(fetch: WithKeyCacheFetch<V, K>, key: K): Cached<V, K>
    {
        return new Cached<V, K>((value: Opt<V>, key: K) => fetch(key), key);
    }

    static withValue<V>(fetch: WithValueCacheFetch<V>): Cached<V, string>
    {
        return new Cached<V>((value: Opt<V>, key: string) => fetch(value), "");
    }

    static simple<V>(fetch: SimpleCacheFetch<V>): Cached<V, string>
    {
        return new Cached<V>((value: Opt<V>, key: string) => fetch(), "");
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