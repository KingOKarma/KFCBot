import * as Canvas from "canvas";
import * as commando from "discord.js-commando";
import * as path from "path";
import { Message, MessageAttachment } from "discord.js";
import { User } from "../../entity/user";
import { getMember } from "../../bot/utils";
import { getRepository } from "typeorm";


export default class LevelCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["lvl", "xp", "lv"],
            args: [
                {
                    default: "",
                    key: "memberID",
                    prompt: "Which member are you giving a bucket to?",
                    type: "string"
                }
            ],
            description: "check your level status with this command",
            group: "xp",
            guildOnly: true,
            memberName: "level",
            name: "level",
            throttling: {
                duration: 5,
                usages: 1
            }
        });
    }
    public async run(
        msg: commando.CommandoMessage,
        { memberID }: {memberID: string;}
    ): Promise<Message | Message[]> {

        let member = getMember(memberID, msg.guild);

        if (member === undefined) {
            // eslint-disable-next-line prefer-destructuring
            member = msg.member;
        }

        const userRepo = getRepository(User);
        const user = await userRepo.findOne({ serverId: member.guild.id, uid: member.user.id });
        if (!user) return msg.say("That user doesn't have any xp stored!");
        let procent = user.xp / ((user.level + 1) * 1000);
        procent *= 100;
        if (Number.isNaN(procent)) procent = 0;
        const canvas = Canvas.createCanvas(700, 250);

        const ctx = canvas.getContext("2d");
        const background = await Canvas.loadImage(path.join(__dirname, "../../../images/xpBackground/backing.png"));

        const lineFill = Math.round(400 * procent / 100);

        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "#74037b";
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // Select the font size and type from one of the natively available fonts
        ctx.font = "50px sans-serif";
        // Select the style that will be used to fill the text in
        ctx.fillStyle = "#ffffff";

        // Actually fill the text with a solid color
        ctx.fillText(member.user.username, canvas.width / 2.8, canvas.height / 2.4);

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

        return msg.say(image);
    }
}
