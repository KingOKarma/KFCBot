import { EmbedFieldData } from "discord.js";
import { SlashCommands } from "../../../interfaces/slashCommands";

export const slashCommand: SlashCommands = {
    description: "Get some general info on the server",
    group: "Utility",
    guildOnly: true,
    name: "serverinfo",
    run: async ({ client, intr }) => {

        const { guild } = intr;

        if (!guild) return client.embedReply(intr, { embed: { description: "No guild was found (?)" } });

        const owner = await guild.fetchOwner();
        const channels = guild.channels.cache.size;
        const users = guild.memberCount;

        let boostLvl;
        switch (guild.premiumTier) {

            case undefined: boostLvl = "Level 0, sorry ):"; break;
            case "NONE": boostLvl = "Level 0, sorry ):"; break;
            case "TIER_1": boostLvl = "Level 1, You're making your way up in the world"; break;
            case "TIER_2": boostLvl = "Level 2, Damn I'm jealous"; break;
            case "TIER_3": boostLvl = "Level 3, Look at this big shot over here"; break;
        }

        const guildTimestamp = client.timestampParse(guild.createdTimestamp.toString());

        const fields: EmbedFieldData[] = [
            { name: "Owner", value: `**${owner} (${owner.user.tag})**` },
            { name: "Boost", value: `**${boostLvl}**\n> Booster count: ${guild.premiumSubscriptionCount}` },
            { name: "Member Count", value: `${users} Users` },
            { name: "Channel Count", value: `${channels} Channels` },
            { name: "Created at", value: `<t:${guildTimestamp}:F> about <t:${guildTimestamp}:R>` }

        ];


        if (guild.afkChannel?.viewable) {
            fields.push({ name: "AFK", value: `\`-\` **Voice Channel: **<#${guild.afkChannelId}>\n \`-\``
            + ` **Category:** ${guild.afkChannel.parent?.name ?? "No Category"}\n`
            + `\`-\` **Bitrate:** ${guild.afkChannel.bitrate / 1000}kbps` });
        }

        if (guild.features.length !== 0) {
            fields.push({ name: "Server Perks", value: `${guild.features.map((p) => `${p
                .charAt(0)
                .toUpperCase()}${p.toLowerCase()
                .slice(1)
                .replace(/_/g, " ")}`)}`
                .replace(/,/g, ", ") });
        }


        return client.embedReply(intr, { embed: {
            title: `${guild}'s Info`,
            description: guild.description ?? undefined,
            thumbnail: { url: guild.iconURL({ dynamic: true }) ?? undefined },
            image: { url: guild.bannerURL({ format: "png", size: 4096 }) ?? undefined },
            fields

        } });

    }
};