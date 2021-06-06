import * as commando from "discord.js-commando";
import { Message } from "discord.js";
import { musicQueue } from "../../bot/globals";

export default class Loop extends commando.Command {
    private constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["lp"],
            description: "Sets the queue to loop",
            group: "music",
            guildOnly: true,
            memberName: "loop",
            name: "loop",
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

        if (queue.connection.channel.members.some((i) => i.id === msg.author.id)) {
            queue.looping = !queue.looping;


            if (queue.looping) {
                return msg.say("The queue is now looping");
            }

            return msg.say("Stopped looping the queue");
        }

        return msg.say("You have to be in the as me to use this comamnd");

    }
}
