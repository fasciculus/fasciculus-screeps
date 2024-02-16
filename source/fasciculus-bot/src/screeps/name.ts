
interface NamesMemory
{
    creeps: { [kind: string]: number },
    flags: { [kind: string]: number }
}

export class Names
{
    private static _initialNamesMemory: NamesMemory = { creeps: {}, flags: {} };

    private static get memory(): NamesMemory
    {
        return Memory.get("names", Names._initialNamesMemory);
    }

    static kind(name: string): string
    {
        return name.charAt(0);
    }

    private static nextName(kind: string, names: { [kind: string]: number }): string
    {
        kind = Names.kind(kind);

        const nextIndex: number = (names[kind] || 0) + 1;

        names[kind] = nextIndex;

        return kind + nextIndex;
    }

    static nextCreepName(kind: string): string
    {
        return Names.nextName(kind, Names.memory.creeps);
    }

    static nextFlagName(kind: string): string
    {
        return Names.nextName(kind, Names.memory.flags);
    }
}