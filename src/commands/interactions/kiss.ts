import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import { CONFIG } from "../../bot/globals";
import fetch from "node-fetch";
import { getMember } from "../../bot/utils";

// Creates a new class (being the command) extending off of the commando client
export default class KissCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            args: [
                {
                    default: "",
                    key: "memberID",
                    prompt: "Which member are you kissing?",
                    type: "string"
                }
            ],
            clientPermissions: ["EMBED_LINKS"],
            description: "I allow you to kiss another person!",
            group: "interactions",
            guildOnly: true,
            memberName: "kiss",
            name: "kiss",
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
            `https://api.giphy.com/v1/gifs/search?api_key=${CONFIG.giphyAPI}&q=anime kiss&limit=25`,
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


        let member = getMember(memberID, msg.guild);
        let description;

        if (member === undefined) {
            // eslint-disable-next-line prefer-destructuring
            member = msg.member;
            description = `Aww **${msg.member.displayName}** wants a kiss 🥺 here have one from me, Mwah <:KaineCute:735541745433182288>`;
        } else {
            description = `${msg.member.displayName} just kissed **${member.displayName}**, Now that's hot 🥺`;
        }

        if (member.user.id === msg.guild.me.id) {
            member = msg.guild.me;
            description = "I- you want to kiss me? <a:KaineFlushed:811033124976197642>... well then... Mwah";

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

