/**
 * @type {GlobalEmotes}
 * @property {string} chickenNuggie Nuggies Emote
 * @property {string} verifiedEmote Verified Emote
 */
export interface GlobalEmotes {
    chickenNuggie: string;
    verifiedEmote: string;
}

/**
 * @type {GlobalIDs}
 * @property {GlobalChannelIDs} channels Verified Emote
 * @property {GlobalGuildIDs} guilds Channel ID
 */
export interface GlobalIDs {
    channels: GlobalChannelIDs;
    guilds: GlobalGuildIDs;
}

interface GlobalGuildIDs {
    supportGuild: string;
}

interface GlobalChannelIDs {
    kfcLogs: string;
    kfcSuggestions: string;
}