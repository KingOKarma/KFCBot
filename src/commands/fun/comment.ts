import * as commando from "discord.js-commando";
import { Message, MessageAttachment } from "discord.js";
import { createCanvas, loadImage } from "canvas";
import path from "path";

// Creates a new class (being the command) extending off of the commando client
export default class CommentCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["cm"],
            args: [
                {
                    key: "comment",
                    prompt: "What do you want your comment to say?",
                    type: "string"
                }
            ],
            clientPermissions: ["ATTACH_FILES"],
            description: "I'll convert your message into a youtube comment!",
            group: "fun",
            guildOnly: true,
            memberName: "comment",
            name: "comment",
            throttling: {
                duration: 3,
                usages: 2
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { comment }: { comment: string; }
    ): Promise<Message | Message[]> {

        const numbers = Math.floor(Math.random() * 1000 + 1);
        const numbers2 = Math.floor(Math.random() * 1000 + 1);


        const canvas = createCanvas(700, 168);
        const ctx = canvas.getContext("2d");

        const backgroundTemp = ["comment-template.png", "comment-template-like.png", "comment-template-dislike.png"];
        const backTemp = backgroundTemp[Math.floor(Math.random() * backgroundTemp.length)];


        const background = await loadImage(path.join(__dirname, `../../../images/commentBG/${backTemp}`));
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "#74037b";
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        ctx.font = "18px sans-serif";
        ctx.rotate(0);
        ctx.fillStyle = "#000000";
        ctx.fillText(`${msg.member.displayName}`, canvas.width / 6.5, canvas.height / 3.7);

        ctx.font = "15px sans-serif";
        ctx.rotate(0);
        ctx.fillStyle = "#000000";

        let output = comment;
        if (comment.length >= 70) {
            const postition = 70;
            const seporator = "\n";
            output = [comment.slice(0, postition), seporator, comment.slice(postition)].join("");
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
        ctx.fillText(`${numbers}`, canvas.width / 5.5, canvas.height / 1.6);

        ctx.font = "17px sans-serif";
        ctx.rotate(0);
        ctx.fillStyle = "#2869d6";
        ctx.fillText(`${numbers2} Replies`, canvas.width / 4, canvas.height / 1.15);

        // Pick up the pen
        ctx.beginPath();
        // Start the arc to form a circle
        ctx.arc(64, 60, 30, 0, Math.PI * 2, true);
        // Put the pen down
        ctx.closePath();
        // Clip off the region you drew on
        ctx.clip();

        const avatar = await loadImage(msg.member.user.displayAvatarURL({ format: "png" }));
        ctx.drawImage(avatar, 30, 30, 64, 60);

        const attachment = new MessageAttachment(canvas.toBuffer(), "Comment.png");
        return msg.say(attachment);
    }
}
