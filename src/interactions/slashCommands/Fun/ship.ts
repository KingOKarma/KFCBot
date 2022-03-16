import { GuildMember, MessageAttachment } from "discord.js";
import { createCanvas, loadImage } from "canvas";
import { SlashCommands } from "../../../interfaces/slashCommands";
import path from "path";
import { slashCommandTypes } from "../../../globals";

const vowels = ["a", "e", "i", "o", "u", "y"];

export const slashCommand: SlashCommands = {
    description: "Mash up names to find true love",
    group: "Fun",
    name: "ship",
    permissionsBot: ["ATTACH_FILES"],
    options: [
        {
            name: "partner1",
            description: "Who is the first user",
            type: slashCommandTypes.user
        },
        {
            name: "partner2",
            description: "Who is the second user",
            type: slashCommandTypes.user
        }
    ],

    run: async ({ client, intr }) => {


        let partner = intr.options.getMember("partner1") as GuildMember | null;
        let partner2 = intr.options.getMember("partner2") as GuildMember | null;
        if (!partner)
            partner = intr.member as GuildMember;

        if (!partner2)
            partner2 = intr.member as GuildMember;


        const canvas = createCanvas(1084, 562);
        const ctx = canvas.getContext("2d");

        const name1 = partner.displayName ? partner.displayName : partner.user.username;
        const name2 = partner2.displayName ? partner2.displayName : partner2.user.username;
        const shipname = await combinename(name1, name2);

        const avatar = await loadImage(partner.user.displayAvatarURL({ format: "jpg", size: 512 }));
        const avatar2 = await loadImage(partner2.user.displayAvatarURL({ format: "jpg", size: 512 }));
        const heart = await loadImage(path.join(__dirname, "../../../../images/ship/heart.png"));

        // registerFont(path.join(__dirname, "../../../fonts/sans-serif.otf"), { family: "sans-serif" });

        ctx.drawImage(avatar, 25, 25, 512, 512);
        ctx.drawImage(avatar2, 550, 25, 512, 512);
        ctx.drawImage(heart, 406, 156, 280, 280);

        ctx.font = "60px sans-serif";
        ctx.fillStyle = "#ffffff";

        let random = (Math.random() * 100).toFixed(2);

        let sendintr = `**${name1}**'s and **${name2}**'s shipname will be **"${shipname}"** <:KaineCute:735541745433182288>`;

        if (name1 === name2) {
            sendintr = `**${name1}** You should always love yourself! <a:KaineHype:823917977954287616>`
                + `Also your shipname is **${shipname}**`;
            random = "101";
        }

        ctx.textAlign = "center";
        ctx.fillText(`${random}%`, canvas.width / 2, canvas.height / 2);

        const image = new MessageAttachment(canvas.toBuffer(), "ship.png");

        return client.embedReply(intr, { embed: { description: sendintr }, files: [image] });
    }
};

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
    for (let i = mid1; i >= 0; i--) {
        count1++;
        if (vowels.includes(name1.charAt(i).toLowerCase())) {
            i = -1;
        } else if (i === 0) {
            noVowel1 = true;
        }
    }
    for (let i = mid2; i < name2.length; i++) {
        count2++;
        if (vowels.includes(name2.charAt(i).toLowerCase())) {
            i = name2.length;
        } else if (i === name2.length - 1) {
            noVowel2 = true;
        }
    }

    let name = "";
    if (noVowel1 && noVowel2) {
        name = name1.substring(0, mid1 + 1);
        name += name2.substring(mid2);
    } else if (count1 <= count2) {
        name = name1.substring(0, mid1 - count1 + 1);
        name += name2.substring(mid2);
    } else {
        name = name1.substring(0, mid1 + 1);
        name += name2.substring(mid2 + count2);
    }
    return name;
}