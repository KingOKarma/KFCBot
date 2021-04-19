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
                    prompt: "where do you want your quote from",
                    type: "string"
                }
            ],
            description: "I will read out the fotune of the user",
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
                const message = await msg.say("Getting your quote, Please stand by");
                return message.edit(await getAnimeQuote());
            }

            case "random":
            {
                const message = await msg.say("Getting your quote, Please stand by");
                return message.edit(await getAnimeQuote());
            }

            default:
                return msg.say("somehow i ended up in the end of my button table. please report this to a developer :)");

        }

    }
}

