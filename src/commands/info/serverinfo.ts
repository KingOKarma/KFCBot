import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";

// Creates a new class (being the command) extending off of the commando client
export default class ServerInfoCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["guildinfo", "server", "guild"],
            clientPermissions: ["EMBED_LINKS"],
            description: "Check the stats and info of the server!!",
            group: "info",
            guarded: true,
            guildOnly: true,
            memberName: "serverinfo",
            name: "serverinfo",
            throttling: {
                duration: 3,
                usages: 2
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage
    ): Promise<Message | Message[]> {

        if (!msg.guild.available) {
            return msg.say("Currently This server is in a server outage");
        }


        if (msg.guild.me === null) {
            return msg.say("There was a problem please report it to the developers?");
        }

        let guildicon = msg.guild.iconURL({ dynamic: true });
        if (guildicon === null) {
            guildicon = "";
        }

        let bannerurl = msg.guild.bannerURL({ size: 4096 });
        if (bannerurl === null) {
            bannerurl = "";
        }

        let afkchannel = true;

        if (msg.guild.afkChannel === null) {
            afkchannel = false;
        } else if (!msg.guild.afkChannel.viewable) {
            afkchannel = false;
        }

        const channels = msg.guild.channels.cache.size;
        const users = msg.guild.members.cache.size;

        let boostLvl;
        switch (msg.guild.premiumTier) {
            case 0:
                boostLvl = "Level 0, sorry ):";
                break;

            case 1:
                boostLvl = "Level 1, You're making your way up in the world";
                break;

            case 2:
                boostLvl = "Level 2, Damn I'm jealous";
                break;

            case 3:
                boostLvl = "Level 3, Look at this big shot over here";
                break;
        }


        const embed = new MessageEmbed()
            .setTitle("Server Information")
            .setThumbnail(guildicon)
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
            .setColor(msg.guild.me.displayColor)
            .setDescription(`**${msg.guild.name}'s Info:**`)
            .setImage(bannerurl)
            .addField("Owner", `**${msg.guild.owner?.user.tag}** (${msg.guild.owner?.id})`)
            .addField("Boost", `**${boostLvl}**\nBooster count: ${msg.guild.premiumSubscriptionCount}`)
            .addField("Member Count", `${users} users`)
            .addField("Channel Count", `${channels} channels`)
            .addField("Region", `${msg.guild.region}`)
            .addField("Created at", msg.guild.createdAt.toUTCString())
            .setFooter(`This server's prefix is ${msg.guild.commandPrefix}`);

        if (msg.guild.description !== null) {
            embed.addField("Description", `${msg.guild.description}`);
        }

        if (afkchannel) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            embed.addField("AFK", `\`-\` **Voice Channel: **${msg.guild.afkChannel!.name}\n \`-\``
            + ` **Catagory:** ${msg.guild.afkChannel?.parent?.name}\n`
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            + `\`-\` **Bitrate:** ${msg.guild.afkChannel?.bitrate! / 1000}kbps`);

        }

        if (msg.guild.features.length !== 0) {
            embed.addField("Server Perks", `${msg.guild.features.map((p) => `${p
                .charAt(0)
                .toUpperCase()}${p.toLowerCase()
                .slice(1)
                .replace(/_/g, " ")}`)}`
                .replace(/,/g, ", "));
        }

        return msg.say(embed);
    }
}

