import { Guild, GuildTextBasedChannel, MessageEmbedOptions } from "discord.js";
import { Event } from "../interfaces/index";

export const event: Event = {
    name: "guildDelete",
    run: async (client, guild: Guild) => {

        const homeGuild: Guild = await guild.client.guilds.fetch(client.globalIds.guilds.supportGuild);

        const homeLogs = homeGuild.channels.cache.get(client.globalIds.channels.kfcLogs) as GuildTextBasedChannel;

        const owner = await guild.client.users.fetch(guild.ownerId);

        const embed: MessageEmbedOptions = {
            author: { name: owner.tag, iconURL: owner.displayAvatarURL({ dynamic: true }) },
            title: "Guild Left ):",
            thumbnail: { url: guild.iconURL( { dynamic: true }) ?? undefined },
            color: "RED",
            image: { url: guild.bannerURL( { "format": "png" }) ?? undefined },
            description: `${client.user?.tag} has left \`${guild.name}\` (${guild.id})`
            + `\nOwner: **${owner.tag}**\nMember Count: **${guild.memberCount}**`,
            footer: { text: `We're now in ${guild.client.guilds.cache.size} guilds!` }

        };

        await homeLogs.send({ embeds: [embed] });

    }
};
