import * as commando from "discord.js-commando";
import { Message } from "discord.js";
import { musicQueue } from "../../bot/globals";
import { queuePaginate } from "../../bot/utils";

export default class TopCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["q"],
            args: [
                {
                    default: "1",
                    error: "Please only use a number for the page",
                    key: "page",
                    prompt: "What page are you looking for?",
                    type: "integer",
                    validate: (amount: number): boolean => amount >= 0
                }
            ],
            clientPermissions: ["EMBED_LINKS"],
            description: "Lists the XP leaderboard for the server!",
            group: "music",
            guildOnly: true,
            memberName: "queue",
            name: "queue",
            throttling: {
                duration: 30,
                usages: 2
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { page }: { page: number; }
    ): Promise<Message | Message[]> {
        if (msg.guild === null )
            return msg.say("This is an guild only command");

        const queue = musicQueue.get(msg.guild.id);

        if (!queue)
            return msg.say("Im am currently not playing any music in any VCs");

        const songs = queuePaginate(queue.songs, 10, page);

        let list = "";

        for (let i = 0; i < songs.length; i++) {
            list += `${i + 1}) ${songs[i].title} (${songs[i].lengthSeconds})\n`;
        }

        if (songs.length === 0) {
            return msg.say("This page is empty!");
        }

        if (songs.length <= 10) {
            return msg.say(`\`\`\`ml\n${list}\n End of queue\n\`\`\``);
        }

        return msg.say(`\`\`\`prolog\n${list}\n\`\`\``);

    }
}
