import { GlobalEmotes, GlobalIDs } from "../types/globalTypes";
import Config from "./config";
import { Queue } from "../types/musicTypes";

export const CONFIG = Config.getConfig();

export const globalEmotes: GlobalEmotes = {
    chickenNuggie: "<:chickennuggies:810599204300521512>",
    statuses: {
        dnd: "<:DnD:813085519075606548>",
        idle: "<:Idle:813085529917751301>",
        invisible: "<:Invisible:813085537702772796>",
        offline: "<:Offline:813085510947045427>",
        online: "<:Online:813085501997318184>"
    },

    verifiedEmote: "<:verified:850823958952542209>"
};

export const globalIDs: GlobalIDs = {
    channels: {
        kfcLogs: "700438892888719501",
        kfcSuggestions: "699030000753442867",
        kfcUpvotes: "774069766854803456"
    },
    guilds: {
        supportGuild: "605859550343462912"
    }
};

// Export const verifiedEmote = "<:verified:850823958952542209>";

// Export const chickenNuggie = "<:chickennuggies:810599204300521512>";

// Export const supportGuild = "605859550343462912";

// Export const kfcLogs = "700438892888719501";

// Export const kfcSuggestions = "699030000753442867";

export const musicQueue = new Map<string, Queue>();