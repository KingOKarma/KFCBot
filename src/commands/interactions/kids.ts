import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import { CONFIG } from "../../bot/globals";
import fetch from "node-fetch";
import { getMember } from "../../bot/utils";

// Creates a new class (being the command) extending off of the commando client
export default class KidsCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["children"],
            args: [
                {
                    default: "",
                    key: "memberID",
                    prompt: "Which member are you checking the kid count for?",
                    type: "string"
                }
            ],
            clientPermissions: ["EMBED_LINKS"],
            description: "I will count how many kids a user is going to have in the future!",
            group: "interactions",
            guildOnly: true,
            memberName: "kids",
            name: "kids",
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

        if (msg.guild.me === null) {
            return msg.say("There was a problem please report it to the developers?");
        }

        const res = await fetch(
            `https://api.giphy.com/v1/gifs/search?api_key=${CONFIG.giphyAPI}&q=cute-anime&limit=10`,
            {
                headers: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                }
            }
        );

        if (res.status !== 200) {
            throw new Error(`Received a ${res.status} status code`);
        }

        const body = await res.json();

        const random = body.data[Math.floor(Math.random() * body.data.length)];

        const kidCount = Math.floor(Math.random() * (10000 - 0 + 1)) + 0;


        let member = getMember(memberID, msg.guild);
        let description;

        if (member === undefined) {
            // eslint-disable-next-line prefer-destructuring
            member = msg.member;
            description = `In the future **you** will have will have \`${kidCount}\` kid(s)`;
        } else {
            description = `In the future **${member.user.tag}** will have will have \`${kidCount}\` kid(s)`;
        }

        if (member.user.id === msg.guild.me.id) {
            member = msg.guild.me;
            description = `Well for me I'd a assume that I would have \`${kidCount}\` kid(s) <a:KaineFlushed:811033124976197642>`;

        }

        const embed = new MessageEmbed()
            .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(description)
            .setImage(random.images.original.url)
            .setColor(msg.guild.me.displayColor)
            .setFooter("This gif was obtained from https://giphy.com/");

        return msg.say(embed);
    }
}

