
export class Ids
{
    static isFlagId(id: string): id is FlagId
    {
        return id.startsWith("F_");
    }

    static flagId(flag: Flag): FlagId
    {
        return ("F_" + flag.name) as FlagId;
    }
}