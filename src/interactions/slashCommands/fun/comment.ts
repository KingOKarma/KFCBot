import { createCanvas, loadImage } from "canvas";
import { MessageAttachment } from "discord.js";
import { SlashCommands } from "../../../interfaces/slashCommands";
import path from "path";
import { slashCommandTypes } from "../../../globals";

export const slashCommand: SlashCommands = {
    description: "Turn your message into a Youtube comment",
    group: "Fun",
    name: "comment",
    options: [
        {
            description: "What will be converted",
            name: "message",
            required: true,
            type: slashCommandTypes.string
        }
    ],
    permissionsBot: ["ATTACH_FILES"],
    run: async ({ client, intr }) => {

        const numbers = Math.floor(Math.random() * 5000 + 1);
        const numbers2 = Math.floor(Math.random() * 5000 + 1);
        const message = intr.options.getString("message") ?? "none";

        const canvas = createCanvas(700, 168);
        const ctx = canvas.getContext("2d");

        const backgroundTemp = ["comment-template.png", "comment-template-like.png", "comment-template-dislike.png"];
        const backTemp = backgroundTemp[Math.floor(Math.random() * backgroundTemp.length)];


        const background = await loadImage(path.join(__dirname, `../../../../images/commentBG/${backTemp}`));
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "#74037b";
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        ctx.font = "18px sans-serif";
        ctx.rotate(0);
        ctx.fillStyle = "#000000";
        ctx.fillText(`${intr.user.username}`, canvas.width / 6.5, canvas.height / 3.7);

        ctx.font = "15px sans-serif";
        ctx.rotate(0);
        ctx.fillStyle = "#000000";

        let output = message;
        if (message.length >= 70) {
            const postition = 70;
            const seporator = "\n";
            output = [message.slice(0, postition), seporator, message.slice(postition)].join("");
        }

        ctx.fillText(output, canvas.width / 6.5, canvas.height / 2.4);

        // Possibly will add something like this in the future VVVVVV
        // Ctx.font = 'bold 12px sans-serif'
        // Ctx.rotate(0)
        // Ctx.fillStyle = '#A0A0A0';
        // Ctx.fillText(`"number" days ago`, canvas.width/6.5, canvas.height/6 );

        ctx.font = "bold 13.5px sans-serif";
        ctx.rotate(0);
        ctx.fillStyle = "#A0A0A0";
        ctx.fillText(`${client.sepThousands(numbers)}`, canvas.width / 5.5, canvas.height / 1.6);

        ctx.font = "17px sans-serif";
        ctx.rotate(0);
        ctx.fillStyle = "#2869d6";
        ctx.fillText(`${client.sepThousands(numbers2)} Replies`, canvas.width / 4, canvas.height / 1.15);

        // Pick up the pen
        ctx.beginPath();
        // Start the arc to form a circle
        ctx.arc(64, 60, 30, 0, Math.PI * 2, true);
        // Put the pen down
        ctx.closePath();
        // Clip off the region you drew on
        ctx.clip();

        const avatar = await loadImage(intr.user.displayAvatarURL({ format: "png" }));
        ctx.drawImage(avatar, 30, 30, 64, 60);

        const attachment = new MessageAttachment(canvas.toBuffer(), "Comment.png");
        return client.reply(intr, { files: [attachment] });
    }
};
