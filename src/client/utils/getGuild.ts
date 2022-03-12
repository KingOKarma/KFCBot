import { Client, Guild } from "discord.js";

export async function getGuild(guildID: string | null, client: Client): Promise<Guild | null> {
    if (typeof guildID !== "string" ) return null;
    try {
        return await client.guilds.fetch(guildID);
    } catch (e) {
        return null;
    }
}