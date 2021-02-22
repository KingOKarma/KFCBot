import * as commando from "discord.js-commando";
import { Message } from "discord.js";
// Creates a new class (being the command) extending off of the commando client
export default class SayCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            // Creates aliases
            aliases: ["s", "sentence"],
            // These are your arguments
            args: [
                {
                    key: "args1",
                    prompt: "Give me something good to say!",
                    type: "string"
                }
            ],
            clientPermissions: ["MANAGE_MESSAGES"],
            description: "I can say whatever the user wants!",
            group: "fun",
            memberName: "say",
            name: "say",
            throttling: {
                duration: 5,
                usages: 3
            }
        });
    }

    // Now to run the actual command, the run() parameters need to be defiend (by types and names)
    public async run(
        msg: commando.CommandoMessage,
        { args1 }: { args1: string; }
    ): Promise<Message | Message[]> {
    // Deletes command usage
        void msg.delete();
        // Responds with whatever the user has said.
        return msg.say(args1);
    }
}
