import * as commando from "discord.js-commando";
import { Message } from "discord.js";
import { musicQueue } from "../../bot/globals";


export default class TopCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["n", ">", "sk", "next"],
            args: [
                {
                    default: "1",
                    error: "Please only use numbers",
                    key: "times",
                    prompt: "How many songs do you want to skip?",
                    type: "integer"
                }
            ],
            clientPermissions: ["EMBED_LINKS"],
            description: "Lists the XP leaderboard for the server!",
            group: "music",
            guildOnly: true,
            memberName: "skip",
            name: "skip",
            throttling: {
                duration: 30,
                usages: 3
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { times }: { times: number; }
    ): Promise<Message | Message[]> {
        if (msg.guild === null) {
            return msg.say("Sorry but this is an guild only command");
        }

        const queue = musicQueue.get(msg.guild.id);

        if (!queue)
            return msg.say("I'm currently not playing in any vc");
        // Checks of the user in the vc
        if (queue.connection?.channel.members.some((i) => i.id === msg.author.id) ?? false)
            queue.at += times - 1;

        musicQueue.set(msg.guild.id, queue);
        queue.connection?.dispatcher.end();
        const song = queue.songs[queue.at];
        if (times <= 1) {
            return msg.say({ embed: {
                description: `Succesfully skipped [${song.title}](${song.url})`
            } });
        }
        return msg.say({ embed: {
            title: `Succesfully skipped ${times} songs`
        } });

    }
}
