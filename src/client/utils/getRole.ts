import { Guild, Role } from "discord.js";

/**
 * Used to get a Role instance using fetch
 * @param {string} rid The Role's ID
 * @param {Guild} guild the Guild Instance
*  @returns Role
 */
export async function getRole(rid: string | null, guild: Guild | null): Promise<Role | null> {
    if (typeof rid !== "string") return null;
    if (!(guild instanceof Guild)) return null;

    let ridParsed = rid;

    if (rid.startsWith("<@&") && rid.endsWith(">")) {
        const re = new RegExp("[<@&>]", "g");
        ridParsed = rid.replace(re, "");
    }
    try {
        return await guild.roles.fetch(ridParsed);
    } catch (e) {
        return null;
    }
}