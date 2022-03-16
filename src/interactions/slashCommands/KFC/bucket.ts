import { GuildMember, MessageAttachment } from "discord.js";
import { createCanvas, loadImage } from "canvas";
import { SlashCommands } from "../../../interfaces/slashCommands";
import { slashCommandTypes } from "../../../globals";

export const slashCommand: SlashCommands = {
    description: "Slap a brand spankin new KFC Bucket on your's or another user's (avatar) head",
    group: "KFC",
    name: "bucket",
    options: [
        {
            description: "The user getting their own Bucket",
            name: "user",
            type: slashCommandTypes.user
        }
    ],
    permissionsBot: ["ATTACH_FILES"],
    run: async ({ client, intr }) => {

        let member = intr.options.getMember("user") as GuildMember | null;

        if (!member) member = intr.member as GuildMember;
        let description;

        if (member.id === intr.user.id) {
            description = `Welcome to the KFC army **${member.displayName}**, You are a true soldier!`;
        } else {
            description = `${(intr.member as GuildMember).displayName} just gave **${member.displayName}** Their own bucket hat!\nWelcome to the KFC army soldier`;
        }

        if (member.user.id === client.user?.id) {
            member = intr.guild?.me as GuildMember;
            description = "I mean I already have my own hat but sure I'll wear 2 any day!";

        }

        const canvas = createCanvas(450, 500);
        const ctx = canvas.getContext("2d");


        const avatar = await loadImage(member.user.displayAvatarURL({ format: "png" }));
        ctx.drawImage(avatar, 0, 100, canvas.width, 400);

        const bucket = await loadImage("./images/KFCmodule/kfchat.png");
        ctx.drawImage(bucket, -50, 0, 550, 550);

        const file = new MessageAttachment(canvas.toBuffer(), "Bucket.png");


        return client.embedReply(intr, { embed: { description, image: { url: "attachment://Bucket.png" } }, files: [file] });

    }
};
