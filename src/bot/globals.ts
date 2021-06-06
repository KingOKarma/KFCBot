import { GlobalEmotes, GlobalIDs } from "../types/globalTypes";
import Config from "./config";
import { Queue } from "../types/musicTypes";

export const CONFIG = Config.getConfig();

export const globalEmotes: GlobalEmotes = {
    chickenNuggie: "<:chickennuggies:810599204300521512>",
    verifiedEmote: "<:verified:850823958952542209>"
};

export const globalIDs: GlobalIDs = {
    channels: {
        kfcLogs: "700438892888719501",
        kfcSuggestions: "699030000753442867"
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