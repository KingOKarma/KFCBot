import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";

// Creates a new class (being the command) extending off of the commando client
export default class MemCountCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["memcount"],
            args: [
                {
                    default: "",
                    key: "type",
                    oneOf: ["bots", "humans", "all"],
                    prompt: "Do you want to look for all kinds, humans or just bots",
                    type: "string"
                }
            ],
            clientPermissions: ["EMBED_LINKS"],
            description: "You can check out many bot, users and total users are in the server!",
            group: "info",
            guildOnly: true,
            memberName: "membercount",
            name: "membercount",
            throttling: {
                duration: 3,
                usages: 2
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { type }: {type: string | null;}
    ): Promise<Message | Message[]> {

        if (msg.guild.me === null) {
            return msg.say("There was a problem please report it to the developers?");
        }

        let guildicon = msg.guild.iconURL({ dynamic: true });
        if (guildicon === null) {
            guildicon = "";
        }
        let bannerurl = msg.guild.bannerURL({ size: 4096 });
        if (msg.guild.bannerURL() === null) {
            bannerurl = "";
        }

        const realuser = msg.guild.members.cache.filter((member) => !member.user.bot).size;
        const botuser = msg.guild.members.cache.filter((member) => member.user.bot).size;

        let useHumans = true;
        let useBots = true;

        if (type === "humans") {
            useBots = false;
        }
        if (type === "bots") {
            useHumans = false;
        }

        const embed = new MessageEmbed()
            .setTitle("Member Count")
            .setThumbnail(guildicon)
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
            .setColor(msg.guild.me.displayColor)
            .setDescription(`The current member count for **${msg.guild.name}** is **${msg.guild.memberCount}**`)
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .setImage(bannerurl!);
        if (useHumans) {
            embed.addField("\u200b", `Human Members - **${realuser}**`);
        }

        if (useBots) {
            embed.addField("\u200b", `Bot Members - **${botuser}**`);
        }

        return msg.say(embed);
    }
}

