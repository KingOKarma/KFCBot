import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import randomPuppy from "random-puppy";

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


        randomPuppy(subreddit).then(async (url: string | undefined) => {
            if (msg.guild.me === null) {
                return msg.say("There was a problem please report it to the developers?");
            }
            if (url === undefined) {
                return msg.say("Failed to find an image, pleasae try again!");
            }

            const embed = new MessageEmbed()
                .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
                .setDescription(`Enjoy <:Kaineshrug:711591140125704242> \n This meme was from **r/${subreddit}**`)
                .setImage(url)
                .setColor(msg.guild.me.displayColor)
                .setFooter("Enjoy your memes, with love <3 King Of Karma");

            return msg.say(embed);
        });
        return msg.say("Getting your meme, hold on a second...");
    }
}

