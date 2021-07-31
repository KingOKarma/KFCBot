import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import { randomBunny } from "random-bunny";

// Creates a new class (being the command) extending off of the commando client
export default class WholesomeCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            description: "I'll grab a random wholesome meme from a select number of wholesome subreddits!",
            group: "image",
            memberName: "wholesome",
            name: "wholesome",
            throttling: {
                duration: 3,
                usages: 2
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage
    ): Promise<Message | Message[]> {


        const reddit = [
            "wholesomememes",
            "wholesome",
            "wholesomepics",
            "wholesomeanimemes"
        ];

        const subreddit = reddit[Math.floor(Math.random() * reddit.length)];

        await msg.say("Getting your meme, hold on a second...");

        return randomBunny(`${subreddit}`, "top", async (res: { title: string; url: string; }) => {

            if (msg.guild === null) {
                return msg.say("Sorry there was a problem please try again");
            }

            if (msg.guild.me === null) {
                return msg.say("There was a problem please report it to the developers?");
            }

            const embed = new MessageEmbed()
                .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
                .setTitle(res.title)
                .setDescription(`Enjoy <:Kaineshrug:711591140125704242> \n This wholesome meme was from **r/${subreddit}**`)
                .setImage(res.url)
                .setColor(msg.guild.me.displayColor)
                .setFooter("Enjoy your wholesome memes, with love <3 King Of Karma");

            return msg.say(embed);
        });
    }
}

