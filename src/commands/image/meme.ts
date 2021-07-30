import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import { randomBunny } from "random-bunny";

// Creates a new class (being the command) extending off of the commando client
export default class MemeCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["reddit", "funny"],
            description: "I'll grab a random meme from a select number of subreddits!",
            group: "image",
            memberName: "meme",
            name: "meme",
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
            "meme",
            "animemes",
            "MemesOfAnime",
            "animememes",
            "AnimeFunny",
            "dankmemes",
            "dankmeme",
            "wholesomememes",
            "MemeEconomy",
            "meirl",
            "me_irl",
            "2meirl4meirl",
            "AdviceAnimals"
        ];

        const subreddit = reddit[Math.floor(Math.random() * reddit.length)];

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
                .setDescription(`Enjoy <:Kaineshrug:711591140125704242>\nThis meme was from [r/${subreddit}](https://reddit.com/r/${subreddit})`)
                .setImage(res.url)
                .setColor(msg.guild.me.displayColor)
                .setFooter("Enjoy your memes, with love <3 King Of Karma");

            return msg.say(embed);
        });
    }
}

