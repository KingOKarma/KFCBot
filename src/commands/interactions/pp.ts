import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import { CONFIG } from "../../bot/globals";
import fetch from "node-fetch";
import { getMember } from "../../bot/utils";

// Creates a new class (being the command) extending off of the commando client
export default class PPCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["penis"],
            args: [
                {
                    default: "",
                    key: "memberID",
                    prompt: "Which member are you checking the pp size of?",
                    type: "string"
                }
            ],
            clientPermissions: ["EMBED_LINKS"],
            description: "I'll check yours or another user's pp size!",
            group: "interactions",
            guildOnly: true,
            memberName: "pp",
            name: "pp",
            throttling: {
                duration: 3,
                usages: 2
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { memberID }: { memberID: string; }
    ): Promise<Message | Message[]> {

        if (msg.guild === null) {
            return msg.say("There was a problem please report it to the developers?");
        }

        if (msg.member === null) {
            return msg.say("There was a problem please report it to the developers?");
        }


        if (msg.guild.me === null) {
            return msg.say("There was a problem please report it to the developers?");
        }

        const res = await fetch(
            `https://api.giphy.com/v1/gifs/search?api_key=${CONFIG.giphyAPI}&q=anime penis&limit=25`
        );

        if (res.status !== 200) {
            throw new Error(`Received a ${res.status} status code`);
        }

        const body = await res.json();

        const random = body.data[Math.floor(Math.random() * body.data.length)];

        const ranNum = Math.floor(Math.random() * (50 - -10 + 1)) + -10;
        const args = memberID.split(" ");
        const mem = args.shift();

        if (mem === undefined) return msg.say("Sorry there was a problem, please try again!");

        let member = await getMember(mem, msg.guild);
        let description;
        const footer = args.join(" ");

        if (member === null) {
            // eslint-disable-next-line prefer-destructuring
            member = msg.member;
            description = `Well **${msg.member.displayName}** your pp size is **${ranNum}"** `;
        } else {
            description = `${msg.member.displayName} just checked **${member.displayName}'s** pp size and it's **${ranNum}"**`;
        }

        if (member.user.id === msg.guild.me.id) {
            member = msg.guild.me;
            description = `Now you see my pp size is a wopping **${ranNum}"**`;

        }

        const embed = new MessageEmbed()
            .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(description)
            .setImage(random.images.original.url)
            .setColor(msg.guild.me.displayColor)
            .setFooter(footer);

        return msg.say(embed);
    }
}

