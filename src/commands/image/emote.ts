import * as commando from "discord.js-commando";
import { Message } from "discord.js";
import { getEmote } from "../../bot/utils";

// Creates a new class (being the command) extending off of the commando client
export default class EmoteCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            args: [
                {
                    error: "Only send an emote!",
                    key: "emoteID",
                    prompt: "Which emote do you wish to enlarge??",
                    type: "string"
                }
            ],
            description: "Shows an emote as an image",
            group: "image",
            memberName: "emote",
            name: "emote",
            ownerOnly: true,

            throttling: {
                duration: 5,
                usages: 3
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { emoteID }: {emoteID: string; }
    ): Promise<Message | Message[]> {
        const emote = getEmote(emoteID, this.client);

        if (emote === undefined) {
            return msg.say("Please only send an emote from a server that i'm in");
        }
        let ending = "png";

        if (emote.animated) {
            ending = "gif";
        }
        return msg.say(`https://cdn.discordapp.com/emojis/${emote.id}.${ending}?size4096`);

    }
}
