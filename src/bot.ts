import "reflect-metadata";
import { Client, SQLiteProvider } from "discord.js-commando";
import { onGuildJoin, onGuildLeave, onMessage, onReady } from "./bot/events";
import AutoPoster from "topgg-autoposter";
import { CONFIG } from "./bot/globals";
import { Database } from "sqlite3";
import { createConnections } from "typeorm";
import { open } from "sqlite";
import path from "path";


async function main(): Promise<void> {
    await createConnections();
    const bot = new Client({
        commandPrefix: CONFIG.prefix,
        invite: "https://discord.gg/KPKprPgJWs",
        owner: CONFIG.owners

    });


    // Runs the function defined in ./events
    bot.on("ready", () => void onReady(bot));

    bot.on("message", async (message) => onMessage(message));

    bot.on("guildCreate", async (guild) => onGuildJoin(guild));

    bot.on("guildDelete", async (guild) => onGuildLeave(guild));

    bot.on("error", (error) => {
        console.log(`Error: \n${error.name} \n Stack: ${error.stack} \n Message: ${error.message}`);
    });


    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (CONFIG.topGGKey !== null) {
        const ap = AutoPoster(CONFIG.topGGKey, bot);


        ap.on("posted", () => {
            console.log(`Posted stats to top.gg, guilds ${bot.guilds.cache.size}`);
        });
    }

    // Registers all groups/commands/etc
    bot.registry.registerGroups([
        ["autoresponders", "Autoresponders - I'll respond to certain words!"],
        ["dev", "Dev - These commands can only be executed by the bot owners"],
        ["economy", "Economy - Earning money from KFC? nice!"],
        ["fun", "Fun - Never thought I'd have fun with a bot before"],
        ["image", "Image - Utilise my wonderful features for messing or searching images!"],
        ["info", "Info - Get some quick and easy access to some info!"],
        ["interactions", "Interactions - Interacting with the bot is fun and all but interacting with others is better!"],
        ["kfc", "KFC - The one and only module that is required to be activated at all times"],
        ["other", "Other - Commands which are still a work in progress."],
        ["staff", "Staff - Commands only staff of a server can run."],
        ["xp", "XP - It's not a superhero game, but you can earn xp anyway!"]
    ]).registerDefaults()

        .registerCommandsIn(
            path.join(__dirname, "commands")
        );

    void open({
        driver: Database,
        filename: path.join(__dirname, "../settings.sqlite3")
    }).then(async (db) => {
        await bot.setProvider(new SQLiteProvider(db));
    });

    await bot.login(CONFIG.token);

}

main().catch(console.error);
