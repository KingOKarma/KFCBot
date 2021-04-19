import * as commando from "discord.js-commando";
import { Message } from "discord.js";
import { getAnimeQuote } from "../../bot/utils";

const types = ["anime"];

export default class QuoteCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            args: [
                {
                    default: "random",
                    key: "type",
                    oneOf: types.concat("random"),
                    prompt: "Where do you want your quote from",
                    type: "string"
                }
            ],
            description: "I'll give out a quote from a random anime!",
            group: "fun",
            memberName: "quote",
            name: "quote",
            throttling: {
                duration: 3,
                usages: 2
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { type }: { type: string; }
    ): Promise<Message | Message[]> {

        switch (type) {
            case "anime":
            {
                const message = await msg.say("Getting you an anime quote, Please stand by");
                return message.edit("", { embed: await getAnimeQuote() } );
            }

            case "random":
            {
                const message = await msg.say("Getting you a random quote, Please stand by");
                return message.edit("", { embed: await getAnimeQuote() } );
            }

            default:
            {
                const message = await msg.say("I Couldn't understand what you're telling me to get so I'll get a random quote");
                return message.edit("", { embed: await getAnimeQuote() } );
            }
        }

    }
}

