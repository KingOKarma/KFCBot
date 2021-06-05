import * as commando from "discord.js-commando";
import { Message } from "discord.js";

// Creates a new class (being the command) extending off of the commando client
export default class ECommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {

        super(client, {
            description: "MegaE!",
            group: "autoresponders",
            memberName: "e",
            name: "e",
            patterns: [RegExp(/^e$/)],
            throttling: {
                duration: 5,
                usages: 1
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _args: string,
        fromPattern: boolean
    ): Promise<Message | Message[] | null> {
        console.log(this.isUsable(msg));
        if (fromPattern)
            return msg.say("https://i.imgur.com/gXbZZBI.jpeg");
        return null;
    }
}

