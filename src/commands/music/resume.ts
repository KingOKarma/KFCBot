import * as commando from "discord.js-commando";
import { Message } from "discord.js";
import { musicQueue } from "../../bot/globals";

export default class Resume extends commando.Command {
    private constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["start", "unpause"],
            description: "Resume the song if it has been paused",
            group: "music",
            guildOnly: true,
            memberName: "resume",
            name: "resume",
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
            if (queue.playing) {
                return msg.say("The song is already playing! Want to pause the song? use `k!pause`");
            }
            queue.playing = true;
            queue.connection.dispatcher.resume();
            musicQueue.set(msg.guild.id, queue);
            return msg.say("Successfully resumed the song");
        }

        return msg.say("You must be in the same VC as me to use this comamnd");

    }
}
