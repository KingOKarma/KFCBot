import * as Canvas from "canvas";
import { Command } from "../../interfaces";
import { DBUser } from "../../entity/user";
import { MessageAttachment } from "discord.js";
import { getRepository } from "typeorm";
import path from "path";

export const command: Command = {
    // Note aliases are optional
    aliases: ["lv", "lvl", "xp"],
    description: "Check your current xp count and level",
    example: ["!level"],
    group: "xp",
    name: "level",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async(client, msg, args) => {

        if (msg.guild === null) {
            return msg.reply("This is a guild only command");
        }
        if (msg.member === null) {
            return msg.reply("There was a problem please report it to the developers?");
        }

        let member = await client.getMember(args[0], msg.guild);

        if (member === null) {
            // eslint-disable-next-line prefer-destructuring
            member = msg.member;
        }

        const userRepo = getRepository(DBUser);
        const user = await userRepo.findOne({ serverId: member.guild.id, uid: member.user.id });
        if (!user) return msg.reply("That user doesn't have any xp stored!");
        let procent = user.xp / ((user.level + 1) * 1000);
        procent *= 100;
        if (Number.isNaN(procent)) procent = 0;
        const canvas = Canvas.createCanvas(700, 250);

        const ctx = canvas.getContext("2d");
        const background = await Canvas.loadImage(path.join(__dirname, "../../../images/xpBackground/backing.png"));


        const lineFill = Math.round(400 * procent / 100);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(240, 55, 400, 125);

        ctx.strokeStyle = "#74037b";
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        const userName = member.nickname ?? member.user.username;

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
        ctx.fillText(`${user.xp}/${Math.round((user.level + 1) * 1000)}`, 250, 169);
        const grd = ctx.createLinearGradient(240, 190, 700, 250);
        grd.addColorStop(0, "#e0001b");
        grd.addColorStop(1, "#4f00f2");

        ctx.fillStyle = grd;
        ctx.fillRect(240, 180, 420, 50);
        const lvlBar = await Canvas.loadImage(path.join(__dirname, "../../../images/xpBackground/LevelBoarder.png"));
        ctx.drawImage(lvlBar, 240, 180, 420, 50);

        ctx.fillStyle = "#363636";
        ctx.fillRect(250, 190, 400, 30);
        ctx.fillStyle = "#ffbb00";
        ctx.fillRect(250, 190, lineFill, 30);

        ctx.beginPath();
        ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: "jpg" }));
        ctx.drawImage(avatar, 25, 25, 220, 200);

        const image = new MessageAttachment(canvas.toBuffer(), "levelImage.png");

        return msg.reply({ files: [image] } );
    }
};