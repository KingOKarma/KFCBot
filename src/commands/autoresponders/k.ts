import * as commando from "discord.js-commando";
import { Message } from "discord.js";

// Creates a new class (being the command) extending off of the commando client
export default class KCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            description: "MegaK!",
            group: "autoresponders",
            memberName: "k",
            name: "k",
            patterns: [RegExp(/^k$/)],
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

        if (fromPattern)
            return msg.say("Did you seriously just **\"k\"**  👀");
        return null;

    }
}
