import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";

// Creates a new class (being the command) extending off of the commando client
export default class VoteCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["topgg"],
            clientPermissions: ["EMBED_LINKS"],
            description: "Feel free to vote for bonuses!",
            group: "info",
            memberName: "vote",
            name: "vote",
            throttling: {
                duration: 3,
                usages: 2
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage
    ): Promise<Message | Message[]> {

        if (msg.guild === null) {
            return msg.say("Sorry there was a problem please try again");
        }

        if (msg.guild.me === null) {
            return msg.say("There was a problem please report it to the developers?");
        }

        let guildicon = msg.guild.iconURL({ dynamic: true });
        if (guildicon === null) {
            guildicon = "";
        }


        const embed = new MessageEmbed()
            .setTitle("Voting!")
            .setThumbnail(guildicon)
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
            .setColor(msg.guild.me.displayColor)
            .setDescription("If you want to vote for the bot on top.gg\n[Click Here](https://top.gg/bot/614110037291565056/vote)\n\n"
            + "You will recieve 4 Nuggie rep, and 8 Nuggie rep on the weekends!")
            .setImage("");

        return msg.say(embed);
    }
}

