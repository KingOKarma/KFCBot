import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import fetch from "node-fetch";
import querystring from "querystring";
const trim = (str: string, max: number): string => str.length > max ? `${str.slice(0, max - 3)}...` : str;
export default class UrbanDictionaryCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {

            aliases: ["ud", "urbandictionary", "dictionary"],

            args: [
                {
                    key: "phrase",
                    prompt: "What phrase do you want to look up?",
                    type: "string"
                }
            ],
            description: "Gives you search results from urbandictionary with the phrase you give me!",
            group: "fun",
            memberName: "urban",
            name: "urban",
            throttling: {
                duration: 3,
                usages: 2
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { phrase }: { phrase: string | undefined; }
    ): Promise<Message | Message[]> {
        const query = querystring.stringify({ term: phrase });

        if (phrase === undefined){
            return msg.channel.send("What am I looking up? Please provide a term next time.");
        }

        const { list } = await fetch(`https://api.urbandictionary.com/v0/define?${query}`).then(async (response) => response.json());
        const [answer] = list;

        if (list.length === 0) {
            return msg.channel.send(`No results found for \`${phrase}\``);
        }
        const embed = new MessageEmbed()
            .setColor("BLUE")
            .setTitle(phrase)
            .setURL(answer.permalink)
            .addField("Definition", trim(answer.definition, 1024))
            .addField("Example", trim(answer.example, 1024))
            .addField("Rating", `${answer.thumbs_up} upvotes. ${answer.thumbs_down} downvotes.`);

        return msg.channel.send(embed);
    }

}