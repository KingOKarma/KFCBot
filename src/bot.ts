import "reflect-metadata";
import { CONFIG, globalEmotes, globalIDs } from "./bot/globals";
import { Channel, Intents, MessageEmbed, TextChannel, User } from "discord.js";
import { CommandoClient, CommandoMessage, SQLiteProvider } from "discord.js-commando";
import { createConnection, getRepository } from "typeorm";
import { onCommandRun, onGuildJoin, onGuildLeave, onMessage, onReady } from "./bot/events";
import AutoPoster from "topgg-autoposter";
import { Database } from "sqlite3";
import { GlobalUser } from "./entity/globalUser";
import { Webhook } from "@top-gg/sdk";
import express from "express";
import { networkInterfaces } from "os";
import { open } from "sqlite";
import path from "path";


async function main(): Promise<void> {
    await createConnection();
    const bot = new CommandoClient({
        commandPrefix: CONFIG.prefix,
        invite: "https://discord.gg/qxvCAkSfES",
        owner: CONFIG.owners,
        ws: { intents: Intents.ALL }
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


    bot.dispatcher.addInhibitor((msg: CommandoMessage) => {
        if (msg.command === null) return false;
        if (msg.guild === null) return false;
        if (msg.command.group.id !== "autoresponders") return false;
        let commandEnabled = true;
        if (!msg.command.isEnabledIn(msg.guild)) commandEnabled = false;
        if (!msg.command.group.isEnabledIn(msg.guild)) commandEnabled = false;
        if (commandEnabled) return false;
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

    if (CONFIG.topGGAuth.runTopgg) {

        if (CONFIG.topGGAuth.topGGKey !== null) {
            const ap = AutoPoster(CONFIG.topGGAuth.topGGKey, bot);

            ap.on("posted", () => {
                console.log(`Posted stats to top.gg, guilds ${bot.guilds.cache.size}`);
            });
        }
        const app = express(); // Your express app

        const webhook = new Webhook(CONFIG.topGGAuth.topGGWebhookAuth, { error: (err): void => {
            return void console.log(`There was an error:\nName: ${err.name}\nMessage: ${err.message}${err.stack ?? `\nStack: ${err.stack}`}`);
        } });

        console.log(networkInterfaces());
        const net = networkInterfaces()[0]?.shift();
        console.log(net?.address);
        console.log(webhook);
        let upvoteChannel: Channel;
        try {
            upvoteChannel = await bot.channels.fetch(globalIDs.channels.kfcUpvotes);

        } catch (error) {

            return void console.log("Unable to find upvotes channnel ID!");
        }

        if (upvoteChannel.type !== "text") {
            return void console.log("Please ensure the upvote channel is a text one!");
        }

        app.post("/dblwebhook", webhook.listener(async (vote) => {
            // Vote is your vote object
            console.log(vote);

            const userRepo = getRepository(GlobalUser);
            let user: User;
            try {
                user = await bot.users.fetch(vote.user);

            } catch (error) {
                const embed = new MessageEmbed();
                embed.setAuthor("Unkown user#0000");
                embed.setTitle("Top.gg Upvote!");
                embed.setColor("BLUE");
                embed.setDescription(
                    "**Unkown user#0000** Has upvoted KFC Bucket Boy over at https://top.gg/bot/614110037291565056"
                    + "\nAs they are unknown I am unable to give them any nuggies! ):");
                embed.setFooter("You can also vote it will make me very happy");


                await (upvoteChannel as TextChannel).send(embed);
                return;
            }
            let dbUser = await userRepo.findOne({ uid: vote.user });

            if (dbUser === undefined) {
                const newdbUser = new GlobalUser();
                newdbUser.uid = vote.user;
                newdbUser.tag = user.tag;
                newdbUser.avatar = user.displayAvatarURL({ dynamic: true });
                await userRepo.save(newdbUser);
                dbUser = newdbUser;
            }
            let endMsg = `They have been rewarded with **4** Rep! ${globalEmotes.chickenNuggie}`;
            if (vote.isWeekend === true)
                endMsg = `As it is the Weekend, They have been rewarded with **8** Rep! ${globalEmotes.chickenNuggie}`;

            const embed = new MessageEmbed();
            embed.setAuthor(dbUser.tag, dbUser.avatar);
            embed.setTitle("Top.gg Upvote!");
            embed.setColor("BLUE");
            embed.setDescription(
                `**${dbUser.tag}** Has upvoted KFC Bucket Boy over at https://top.gg/bot/614110037291565056 \n${endMsg}`);
            embed.setFooter("You can also vote it will make me very happy (Changes to rewards soon!)");

            if (vote.isWeekend === true) {
                dbUser.rep += 8;
            } else {
                dbUser.rep += 4;
            }

            await userRepo.save(dbUser);
            await (upvoteChannel as TextChannel).send(embed);


        })); // Attach the middleware

        app.listen(3000, () => {
            console.log(`Listening for upvotes on http://${net?.address}:3000`);
        }); // Your port

    }


}

main().catch(console.error);
