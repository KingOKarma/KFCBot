import * as Canvas from "canvas";
import * as commando from "discord.js-commando";
import { Message } from "discord.js";
import { getMember } from "../../bot/utils";

// Creates a new class (being the command) extending off of the commando client
export default class BucketCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["hat"],
            args: [
                {
                    default: "",
                    key: "memberID",
                    prompt: "Which member are you giving a bucket to?",
                    type: "string"
                }
            ],
            clientPermissions: ["ATTACH_FILES"],
            description: "Every free KFC bucket hat with every purchase!",
            group: "kfc",
            guildOnly: true,
            memberName: "bucket",
            name: "bucket",
            throttling: {
                duration: 3,
                usages: 2
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { memberID }: {memberID: string;}
    ): Promise<Message | Message[]> {

        if (msg.guild.me === null) {
            return msg.say("There was a problem please report it to the developers?");
        }

        let guildicon = msg.guild.iconURL({ dynamic: true });
        if (guildicon === null) {
            guildicon = "";
        }

        let member = getMember(memberID, msg.guild);
        let description;

        if (member === undefined) {
            // eslint-disable-next-line prefer-destructuring
            member = msg.member;
            description = `Welcome to the KFC army **${msg.member.displayName}**, you are a true soldier!`;
        } else {
            description = `${msg.member.displayName} just gave **${member.displayName}** Their own hat! Welcome to the KFC army soldier`;
        }

        if (member.user.id === msg.guild.me.id) {
            member = msg.guild.me;
            description = "I mean I already have my own hat but sure I'll wear 2 any day!";

        }

        const canvas = Canvas.createCanvas(450, 500);
        const ctx = canvas.getContext("2d");


        const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: "png" }));
        ctx.drawImage(avatar, 0, 100, canvas.width, 400);

        const bucket = await Canvas.loadImage("./images/KFCmodule/kfchat.png");
        ctx.drawImage(bucket, -50, 0, 550, 550);

        return msg.say(description, {
            files: [{
                attachment: canvas.toBuffer(),
                name: "Bucket.png"
            }] }).catch(async (err) => {
            return msg.say(`I couldn't give you a bucket ): Reason being: \n${ err}`);
        });

    }
}

