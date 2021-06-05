import * as commando from "discord.js-commando";
import { Message } from "discord.js";

// Creates a new class (being the command) extending off of the commando client
export default class MegaPPCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            description: "MegaPP!",
            group: "autoresponders",
            memberName: "megapp",
            name: "megapp",
            patterns: [RegExp(/^pp$/)],
            throttling: {
                duration: 5,
                usages: 3
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _args: string,
        fromPattern: boolean
    ): Promise<Message | Message[] | null> {

        if (fromPattern)
            return msg.say("My PP hurts man 🍆💦");
        return null;
    }
}
