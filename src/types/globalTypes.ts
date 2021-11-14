/**
 * @type {GlobalEmotes}
 * @property {string} chickenNuggie Nuggies Emote
 * @property {string} verifiedEmote Verified Emote
 * @property {Statuses} status All emotes for statues
 */
export interface GlobalEmotes {
    chickenNuggie: string;
    statuses: Statuses;
    verifiedEmote: string;
}

interface Statuses {
    dnd: string;
    idle: string;
    invisible: string;
    offline: string;
    online: string;
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
    kfcUpvotes: string;
}