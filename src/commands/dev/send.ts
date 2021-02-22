import * as commando from "discord.js-commando";
import { Message } from "discord.js";
import { getUser } from "../../bot/utils";
// Creates a new class (being the command) extending off of the commando client
export default class SendCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            // Creates aliases
            aliases: ["dm", "pm"],
            // These are your arguments
            args: [
                {
                    default: "",
                    key: "memberID",
                    prompt: "Which member are you dming??",
                    type: "string"
                },
                {
                    key: "args1",
                    prompt: "Give me something to send!",
                    type: "string"
                }
            ],
            description: "Send Dms to users!",
            group: "kfc",
            memberName: "send",
            name: "send",
            ownerOnly: true,
            throttling: {
                duration: 5,
                usages: 3
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { memberID, args1 }: { args1: string; memberID: string; }
    ): Promise<Message | Message[]> {

        const user = await getUser(memberID, msg.client);

        if (user === undefined) {
            return msg.say("Sorry that user could not be found!");
        }


        void msg.say(`I just send **${user.tag}:**\n ${args1}`);
        return user.send(args1);
    }
}
