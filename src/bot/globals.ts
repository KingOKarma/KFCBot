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
        kfcLogs: "872907076953854033",
        kfcSuggestions: "872906237715550228",
        kfcUpvotes: "872905668670148748"
    },
    guilds: {
        supportGuild: "872903648068374598"
    }
};

export const musicQueue = new Map<string, Queue>();
