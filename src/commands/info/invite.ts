import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";

// Creates a new class (being the command) extending off of the commando client
export default class InviteCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            clientPermissions: ["EMBED_LINKS"],
            description: "Quick and easy link to invite the bot to your own server!",
            group: "info",
            guarded: true,
            guildOnly: true,
            memberName: "invite",
            name: "invite",
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
        if (this.client.user === null) {
            return msg.say("Im not sure how you got this problem but please report this imediatly to the dev");
        }
        const invite = "https://discord.com/oauth2/authorize?client_id=614110037291565056&scope=bot%20applications.commands&permissions=8589934591";


        const embed = new MessageEmbed()
            .setTitle("Bot Information")
            .setThumbnail(guildicon)
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true, size: 4096 }))
            .setColor(msg.guild.me.displayColor)
            .setImage(this.client.user.displayAvatarURL( { dynamic: true } ))
            .setDescription("KFC Bucket Boy is your new best friend!\nBot owned and written by <@406211463125008386> **King Of Karma#0069**")
            .addField("Invite Me", `[Click Here](${invite})`, true)
            .addField("Support Server", "[Click Here](https://support.bucketbot.dev)", true)
            .setFooter("Feel free to support the future of the bot by suggesting your own thoughts!");

        return msg.say(embed);
    }
}

