import * as commando from "discord.js-commando";
import { Message } from "discord.js";
import moment from "moment";
import { musicQueue } from "../../bot/globals";
import { paginate } from "../../bot/utils";

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

        if (!queue || queue.connection === null)
            return msg.say("Im am currently not playing any music in any VCs");

        const songs = paginate(queue.songs, 10, page);

        let list = "";


        for (let i = 0; i < songs.length; i++) {
            if (queue.at === i) {
                const left = moment
                    .unix(parseInt(queue.songs[i].lengthSeconds, 10))
                    .subtract(queue.connection.dispatcher.streamTime, "milliseconds")
                    .format("mm:ss");

                list += `\n🠗 Currently playing \n${i + 1}) ${songs[i].title} (Left ${left})\n🠕 Currently playing \n`;
            } else {
                list += `${i + 1}) ${songs[i].title}\n`;
            }

        }

        if (songs.length === 0) {
            return msg.say("This page is empty!");
        }

        if (songs.length < 10) {
            return msg.say(`\`\`\`ml\n${list}\n End of queue\n\`\`\``);
        }

        return msg.say(`\`\`\`prolog\n${list}\n\`\`\``);

    }
}
