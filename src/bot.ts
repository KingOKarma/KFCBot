import "reflect-metadata";
import { CommandoClient, CommandoMessage, SQLiteProvider } from "discord.js-commando";
import { onCommandRun, onGuildJoin, onGuildLeave, onMessage, onReady } from "./bot/events";
import AutoPoster from "topgg-autoposter";
import { CONFIG } from "./bot/globals";
import { Database } from "sqlite3";
import { createConnections } from "typeorm";
import { open } from "sqlite";
import path from "path";


async function main(): Promise<void> {
    await createConnections();
    const bot = new CommandoClient({
        commandPrefix: CONFIG.prefix,
        invite: "https://discord.gg/KPKprPgJWs",
        owner: CONFIG.owners

    });


    // Runs the function defined in ./events
    bot.on("ready", () => void onReady(bot));

    bot.on("message", async (message) => onMessage(message, bot));

    // https://discord.js.org/#/docs/commando/master/class/Command?scrollTo=run
    bot.on("commandRun", async (cmd) => onCommandRun(cmd));

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

    bot.dispatcher.addInhibitor((msg: CommandoMessage) => {
        if (msg.command === null) return false;
        if (msg.guild === null) return false;
        if (msg.command.group.id !== "autoresponders") return false;
        let commandEnabled = true;
        if (!msg.command.isEnabledIn(msg.guild)) commandEnabled = false;
        if (!msg.command.group.isEnabledIn(msg.guild)) commandEnabled = false;
        if (commandEnabled) return false;

        console.log("a");

        return "commandDisabled";
    });

    // Registers all groups/commands/etc
    bot.registry.registerDefaultTypes()
        .registerGroups([
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
            ["xp", "XP - It's not a superhero game, but you can earn xp anyway!"],
            ["music", "Music - party with your friends or just play some chill music while studying"]
        ]).registerDefaultGroups()
        .registerDefaultCommands({
            unknownCommand: false
        })

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
