import * as commando from "discord.js-commando";
import { Message } from "discord.js";
import { musicQueue } from "../../bot/globals";

export default class Disconnect extends commando.Command {
    private constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["dc", "leave"],
            description: "disconnects the bot from the VC",
            group: "music",
            guildOnly: true,
            memberName: "disconnect",
            name: "disconnect",
            throttling: {
                duration: 5,
                usages: 3
            }
        });
    }

    // Now to run the actual command, the run() parameters need to be defiend (by types and names)
    public async run(
        msg: commando.CommandoMessage
    ): Promise<Message | Message[]> {
        if (msg.guild === null) {
            return msg.say("Sorry but this is an guild only command");
        }

        const queue = musicQueue.get(msg.guild.id);

        if (!queue)
            return msg.say("I'm currently not playing in any vc");

        if (queue.connection === null)
            return msg.say("I'm currently not playing in any vc");

        // Checks of the user in the vc
        if (queue.connection.channel.members.size >= 1) {
            queue.connection.disconnect();
            return msg.reply("successfully left the VC");
        }

        if (queue.connection.channel.members.some((i) => i.id === msg.author.id)) {
            queue.connection.disconnect();
            return msg.reply("successfully left the VC");
        }

        return msg.say("you have to be in the as me to use this comamnd");

    }
}
