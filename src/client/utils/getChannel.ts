import { AnyChannel, Guild } from "discord.js";
import ExtendedClient from "../client";

export async function getChannel(cid: string | null, guildOrClient: Guild | null | ExtendedClient): Promise<AnyChannel | null> {
    if (typeof cid !== "string") return null;
    let cidParsed = cid;

    if (cid.startsWith("<#") && cid.endsWith(">")) {
        const re = new RegExp("[<#>]", "g");
        cidParsed = cid.replace(re, "");
    }

    if (!(guildOrClient instanceof Guild)) {
        if (guildOrClient instanceof ExtendedClient) {

            try {
                return await guildOrClient.channels.fetch(cidParsed);

            } catch (e) {
                return null;
            }

        } return null;

    }
    try {
        return await guildOrClient.channels.fetch(cidParsed);
    } catch (e) {
        return null;
    }
}