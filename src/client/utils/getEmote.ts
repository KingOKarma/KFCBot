import { Client, GuildEmoji } from "discord.js";

export function getEmote(emote: string | null, client: Client): GuildEmoji | null {
    if (typeof emote !== "string") return null;
    try {
        if (!emote.match(/\:(.*?)\>/g)) {
            return null;
        }

        const findEmote = emote.slice(3).match(/\:.*?\>/g);
        if (findEmote === null) {
            return null;
        }

        const theMatch = findEmote[0].slice(1, -1);

        const returnEmote = client.emojis.cache.get(theMatch);

        if (returnEmote) {
            return returnEmote;
        }

        return null;
    } catch (e) {
        return null;
    }
}