import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import { CONFIG } from "../../bot/globals";

// Creates a new class (being the command) extending off of the commando client
export default class InfoCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["bot", "botinfo"],
            clientPermissions: ["EMBED_LINKS"],
            description: "Just some quick stats on the bot!",
            group: "info",
            guarded: true,
            guildOnly: true,
            memberName: "info",
            name: "info",
            throttling: {
                duration: 3,
                usages: 2
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage
    ): Promise<Message | Message[]> {

        if (msg.guild.me === null) {
            return msg.say("There was a problem please report it to the developers?");
        }

        let guildicon = msg.guild.iconURL({ dynamic: true });
        if (guildicon === null) {
            guildicon = "";
        }

        const channels = msg.client.channels.cache.size;
        const users = msg.client.users.cache.size;
        const guilds = msg.client.guilds.cache.size;

        const embed = new MessageEmbed()
            .setTitle("Bot Information")
            .setThumbnail(guildicon)
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
            .setColor(msg.guild.me.displayColor)
            .setDescription("KFC Bucket Boy is your new best friend!\nBot owned and written by <@406211463125008386> **King Of Karma#0069**")

            .addField("Current Server", msg.guild.name, true)
            .addField("Watching", `${guilds} guilds`, true)
            .addField("Serving", `${users} users`, true)
            .addField("Looking at", `${channels} channels`, true)
            .addField("Library", "Discord.js", true)
            .addField("Language", "Typescript", true)
            .addField("Support Server", "[Click Here](https://support.bucketbot.dev)", true)
            .addField("Invite Me", "[Click Here](https://invite.bucketbot.dev)", true)
            .addField("Website (WIP)", "[Click Here](https://bucketbot.dev)", true)
            .addField("Top.gg", "[Click Here](https://top.gg/bot/614110037291565056)", true)
            .addField("Donate", `[Click Here](https://donatebot.io/checkout/605859550343462912?buyer=${msg.author.id})`, true)
            .addField("Free RAM", "[Click Here](https://www.youtube.com/watch?v=dQw4w9WgXcQ)", true)
            .setFooter(`Use ${CONFIG.prefix}help to check out all of my commands!`);

        return msg.say(embed);
    }
}

