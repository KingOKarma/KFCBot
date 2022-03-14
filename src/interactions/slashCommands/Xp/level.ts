import * as Canvas from "canvas";
import { User as DiscordUser, MessageAttachment } from "discord.js";
import { DBUser } from "../../../entity/user";
import { SlashCommands } from "../../../interfaces";
import { getRepository } from "typeorm";
import path from "path";
import { slashCommandTypes } from "../../../globals";

export const slashCommand: SlashCommands = {
    description: "Check your current xp count and level",
    group: "XP",
    guildOnly: true,
    name: "level",
    options: [
        {
            description: "Who's XP are you checking? (optional)",
            name: "user",
            type: slashCommandTypes.user
        }
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async ({ client, intr }) => {

        if (intr.guild === null) {
            return intr.reply("This is a guild only command");
        }

        let member = intr.options.get("user")?.user;

        if (member === undefined) {
            // eslint-disable-next-line prefer-destructuring
            member = intr.member?.user as DiscordUser;
        }

        const userRepo = getRepository(DBUser);
        const user = await userRepo.findOne({ serverId: intr.guild.id, uid: member.id });

        if (!user) return client.reply(intr, { content: `<@${member.id}> doesn't have any xp stored!`, ephemeral: true });

        let procent = user.xp / ((user.level + 1) * 1000);
        procent *= 100;
        if (Number.isNaN(procent)) procent = 0;
        const canvas = Canvas.createCanvas(700, 250);

        const ctx = canvas.getContext("2d");
        const background = await Canvas.loadImage(path.join(__dirname, "../../../../images/xpBackground/backing.png"));


        const lineFill = Math.round(400 * procent / 100);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(240, 55, 400, 125);

        ctx.strokeStyle = "#74037b";
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        const userName = member.username;

        // Select the font size and type from one of the natively available fonts
        if (userName.length < 15) {
            ctx.font = "50px sans-serif";
        } else if (userName.length < 19) {
            ctx.font = "40px sans-serif";
        } else if (userName.length < 25) {
            ctx.font = "30px sans-serif";
        } else {
            ctx.font = "23px sans-serif";

        }
        // Select the style that will be used to fill the text in
        ctx.fillStyle = "#ffffff";

        // Actually fill the text with a solid color
        ctx.fillText(userName, canvas.width / 2.8, canvas.height / 2.4);

        ctx.font = "34px sans-serif";

        ctx.fillText(`level: ${user.level}`, canvas.width / 2.8, canvas.height / 1.63);

        ctx.font = "12px sans-serif";
        ctx.fillText(`${client.sepThousands(user.xp)}/${client.sepThousands(Math.round((user.level + 1) * 1000))}`, 250, 169);
        const grd = ctx.createLinearGradient(240, 190, 700, 250);
        grd.addColorStop(0, "#e0001b");
        grd.addColorStop(1, "#4f00f2");

        ctx.fillStyle = grd;
        ctx.fillRect(240, 180, 420, 50);
        const lvlBar = await Canvas.loadImage(path.join(__dirname, "../../../../images/xpBackground/LevelBoarder.png"));
        ctx.drawImage(lvlBar, 240, 180, 420, 50);

        ctx.fillStyle = "#363636";
        ctx.fillRect(250, 190, 400, 30);
        ctx.fillStyle = "#ffbb00";
        ctx.fillRect(250, 190, lineFill, 30);

        ctx.beginPath();
        ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        const avatar = await Canvas.loadImage(member.displayAvatarURL({ format: "jpg" }));
        ctx.drawImage(avatar, 25, 25, 220, 200);

        const image = new MessageAttachment(canvas.toBuffer(), "levelImage.png");

        return client.reply(intr, { files: [image] } );
    }
};