import { GuildTextBasedChannel, MessageEmbedOptions, TextChannel, User } from "discord.js";
import AutoPoster from "topgg-autoposter";
import { CONFIG } from "../../../globals";
import ExtendedClient from "../../client";
import { GlobalUser } from "../../../entity/globalUser";
import { Webhook } from "@top-gg/sdk";
import chalk from "chalk";
import express from "express";
import { getRepository } from "typeorm";

export async function initTopgg(client: ExtendedClient): Promise<void> {
    if (CONFIG.tokens.topGGAuth.runTopgg) {

        if (CONFIG.tokens.topGGAuth.topGGKey) {
            const ap = AutoPoster(CONFIG.tokens.topGGAuth.topGGKey, client);

            ap.on("posted", () => {
                console.log(`Posted stats to top.gg, guilds ${client.guilds.cache.size}`);
            });
        }
        const app = express(); // Your express app

        const webhook = new Webhook(CONFIG.tokens.topGGAuth.topGGWebhookAuth, { error: (err): void => {
            console.log(`There was an error:\nName: ${err.name}\nMessage:\n${err.message}${err.stack ?? `\nStack: ${err.stack}`}`);
        } });

        console.log(webhook);
        let upvoteChannel: GuildTextBasedChannel;
        try {
            upvoteChannel = await client.channels.fetch(client.globalIds.channels.kfcUpvotes) as GuildTextBasedChannel;

        } catch (error) {

            console.log("Unable to find upvotes channnel ID!");
            return;
        }

        app.post("/dblwebhook", webhook.listener(async (vote) => {
            // Vote is your vote object
            console.log(vote);

            const userRepo = getRepository(GlobalUser);
            let user: User;
            try {
                user = await client.users.fetch(vote.user);

            } catch (error) {
                const embed: MessageEmbedOptions = {
                    author: { name: "Unknown User#0000" },
                    title: "Top.gg Upvote!",
                    color: "BLURPLE",
                    description: "**Unkown user#0000** Has upvoted KFC Bucket Boy over at https://top.gg/bot/614110037291565056"
                    + "\nAs they are unknown to me I am unable to give them any rewards! ):",
                    footer: { text: "You can also vote using /vote it will make me very happy :D" }
                };

                await upvoteChannel.send({ embeds: [embed] });
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
            let endMsg = `They have been rewarded with **4** Rep! ${client.emotes.chickenNuggie}`;
            if (vote.isWeekend === true) {
                endMsg = `As it is the Weekend, They have been rewarded with **8** Rep! ${client.emotes.chickenNuggie}`;
                dbUser.rep += 8;

            } else {
                dbUser.rep += 4;

            }

            const embed: MessageEmbedOptions = {
                author: { name: dbUser.tag, iconURL: dbUser.avatar },
                title: "Top.gg Upvote!",
                color: "BLURPLE",
                description: `**${dbUser.tag}** Has upvoted KFC Bucket Boy over at https://top.gg/bot/614110037291565056 \n> ${endMsg}`,
                footer: { text: "You can also vote using /vote it will make me very happy :D" }

            };

            await userRepo.save(dbUser);
            await (upvoteChannel as TextChannel).send({ embeds: [embed] });


        })); // Attach the middleware

        app.listen(1122, () => {

            console.log(`${chalk.green("[EXPRESS]")} Listening for top.gg upvotes`);
        }); // Your port

    }
}