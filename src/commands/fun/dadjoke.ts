import * as commando from "discord.js-commando";
import { Message } from "discord.js";
import fetch from "node-fetch";
// Creates a new class (being the command) extending off of the commando client
export default class DadJokeCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["dad"],
            description: "I'll grab a random dadjoke from https://icanhazdadjoke.com/slack",
            group: "fun",
            memberName: "dadjoke",
            name: "dadjoke",
            throttling: {
                duration: 3,
                usages: 2
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage
    ): Promise<Message | Message[]> {

        const res = await fetch(
            "https://icanhazdadjoke.com/slack",
            {
                headers: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    "User-Agent": "My Library (https://github.com/username/repo) https://icanhazdadjoke.com/"
                }
            }
        );

        if (res.status !== 200) {
            throw new Error(`Received a ${res.status} status code`);
        }

        const body = await res.json();
        return msg.say(body.attachments[0].text);
    }
}
