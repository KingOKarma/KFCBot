import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";

// Creates a new class (being the command) extending off of the commando client
export default class GuildsCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["guilds"],
            clientPermissions: ["EMBED_LINKS"],
            description: "You can find out how many servers I'm in!",
            group: "info",
            memberName: "servers",
            name: "servers",
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

        const embed = new MessageEmbed()
            .setTitle("Servers Count")
            .setThumbnail(guildicon)
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
            .setColor(msg.guild.me.displayColor)
            .setDescription(`Im am in **${msg.client.guilds.cache.size}** servers`);


        return msg.say(embed);
    }
}

