import Client from "./client/client";

void new Client({
    intents: ["GUILD_MESSAGES", "GUILDS", "GUILD_BANS", "GUILD_MEMBERS", "DIRECT_MESSAGES", "GUILD_EMOJIS_AND_STICKERS", "GUILD_PRESENCES"]
}).init().catch(console.error);

