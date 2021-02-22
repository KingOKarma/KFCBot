import * as commando from "discord.js-commando";
import { Message } from "discord.js";

const usedCommandRecentlly = new Set();// XP System

// Creates a new class (being the command) extending off of the commando client
export default class ECommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            description: "MegaE!",
            group: "autoresponders",
            memberName: "e",
            name: "e",
            ownerOnly: true,
            patterns: [RegExp(/e/)],
            throttling: {
                duration: 5,
                usages: 3
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage
    ): Promise<Message | Message[] | null> {

        if (usedCommandRecentlly.has(msg.author.id)) {
        } else {
            usedCommandRecentlly.add(msg.author.id);
            setTimeout(() => {
                usedCommandRecentlly.delete(msg.author.id);
            }, 3000);

            return msg.say("https://i.imgur.com/gXbZZBI.jpeg");
        }
        return null;
    }
}
