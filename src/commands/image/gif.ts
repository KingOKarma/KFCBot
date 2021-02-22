import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import { CONFIG } from "../../bot/globals";
import fetch from "node-fetch";

// Creates a new class (being the command) extending off of the commando client
export default class GifCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            args: [
                {
                    key: "search",
                    prompt: "What kind of gif are you looking for?",
                    type: "string"
                }
            ],
            description: "I will grab a gif from https://giphy.com/ depenidng on what the user is searching for!",
            group: "image",
            guildOnly: true,
            memberName: "gif",
            name: "gif",
            throttling: {
                duration: 3,
                usages: 2
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { search }: { search: string; }
    ): Promise<Message | Message[]> {

        if (msg.guild.me === null) {
            return msg.say("There was a problem please report it to the developers?");
        }

        const res = await fetch(
            `https://api.giphy.com/v1/gifs/search?api_key=${CONFIG.giphyAPI}&q=${search}&limit=10`
        );

        if (res.status !== 200) {
            throw new Error(`Received a ${res.status} status code`);
        }

        const body = await res.json();

        const random = body.data[Math.floor(Math.random() * body.data.length)];

        const embed = new MessageEmbed()
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
            .setDescription(`Gif possibly related to ${search}`)
            .setImage(random.images.original.url)
            .setColor(msg.guild.me.displayColor)
            .setFooter("This gif was obtained from https://giphy.com/");

        return msg.say(embed);
    }
}

