/* eslint-disable @typescript-eslint/no-use-before-define */
import * as Canvas from "canvas";
import * as path from "path";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message, MessageAttachment } from "discord.js";
import { getMember } from "../../bot/utils";
const vowels = ["a", "e", "i", "o", "u", "y"];

export default class ShipCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            args: [
                {
                    error: "Who am I shiping exactly ",
                    key: "partnerID",
                    prompt: "Who should I ship you/someone with?",
                    type: "string"
                },
                {
                    default: "",
                    key: "secondPartner",
                    prompt: "Who is the second user to ship?",
                    type: "string"
                }
            ],
            clientPermissions: ["ATTACH_FILES"],
            description: "Mixing names and checking their love!",
            group: "fun",
            memberName: "ship",
            name: "ship"
        });
    }

    public async run(
        msg: CommandoMessage,
        { partnerID, secondPartner }: {
            partnerID: string;
            secondPartner: string;}
    ): Promise<Message | Message[]> {


        if (msg.guild === null) {
            return msg.say("There was a problem please report it to the developers?");
        }

        if (msg.member === null) {
            return msg.say("There was a problem please report it to the developers?");
        }

        const partner = await getMember(partnerID, msg.guild);
        let partner2 = await getMember(secondPartner, msg.guild);
        if (!partner)
            return msg.say("Invalid id please try again!");

        if (!partner2)
            partner2 = msg.member;


        const canvas = Canvas.createCanvas(1084, 562);
        const ctx = canvas.getContext("2d");

        const name1 = partner.displayName ? partner.displayName : partner.user.username;
        const name2 = partner2.displayName ? partner2.displayName : partner2.user.username;
        const shipname = await combinename(name1, name2);

        const avatar = await Canvas.loadImage(partner.user.displayAvatarURL({ format: "jpg", size: 512 }));
        const avatar2 = await Canvas.loadImage(partner2.user.displayAvatarURL({ format: "jpg", size: 512 }));
        const heart = await Canvas.loadImage(path.join(__dirname, "../../../images/ship/heart.png"));

        Canvas.registerFont(path.join(__dirname, "../../../fonts/sans-serif.otf"), { family: "sans-serif" });

        ctx.drawImage(avatar, 25, 25, 512, 512);
        ctx.drawImage(avatar2, 550, 25, 512, 512);
        ctx.drawImage(heart, 406, 156, 280, 280);

        ctx.font = "60px sans-serif";
        ctx.fillStyle = "#ffffff";

        let random = (Math.random() * 100).toFixed(2);

        let sendMsg = `**${name1}**'s and **${name2}**'s shipname will be **"${shipname}"** <:KaineCute:735541745433182288>`;

        if (name1 === name2) {
            sendMsg = `**${name1}** You should always love yourself! <a:KaineHype:823917977954287616>`
            + `Also your shipname is **${shipname}**`;
            random = "101";
        }

        ctx.textAlign = "center";
        ctx.fillText(`${random}%`, canvas.width / 2, canvas.height / 2);

        const image = new MessageAttachment(canvas.toBuffer(), "ship.png");

        return msg.say(sendMsg, image);
    }
}

// Credits goes to ChristopherBThai on github for making this
/**
 * Cambine names of 2 users
 * @param name1 first user's name
 * @param name2 second user's name
 */
async function combinename(name1: string, name2: string): Promise<string> {
    let count1 = -1, count2 = -1;
    const mid1 = Math.ceil(name1.length / 2) - 1;
    const mid2 = Math.ceil(name2.length / 2) - 1;
    let noVowel1 = false, noVowel2 = false;
    for (let i = mid1;i >= 0;i--){
        count1++;
        if (vowels.includes(name1.charAt(i).toLowerCase())){
            i = -1;
        } else if (i === 0){
            noVowel1 = true;
        }
    }
    for (let i = mid2;i < name2.length;i++){
        count2++;
        if (vowels.includes(name2.charAt(i).toLowerCase())){
            i = name2.length;
        } else if (i === name2.length - 1){
            noVowel2 = true;
        }
    }

    let name = "";
    if (noVowel1 && noVowel2){
        name = name1.substring(0, mid1 + 1);
        name += name2.substring(mid2);
    } else if (count1 <= count2){
        name = name1.substring(0, mid1 - count1 + 1);
        name += name2.substring(mid2);
    } else {
        name = name1.substring(0, mid1 + 1);
        name += name2.substring(mid2 + count2);
    }
    return name;
}