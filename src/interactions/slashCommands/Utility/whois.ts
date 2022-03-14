import { GuildMember } from "discord.js";
import { SlashCommands } from "../../../interfaces/slashCommands";
import { slashCommandTypes } from "../../../globals";

export const slashCommand: SlashCommands = {
    description: "Obtain some info from a specific user within a server",
    group: "Utility",
    guildOnly: true,
    name: "whois",
    options: [
        {
            name: "user",
            description: "The user you are looking for",
            type: slashCommandTypes.user
        }
    ],
    run: async ({ client, intr }) => {

        let member = intr.options.getMember("user") as GuildMember | null;

        if (!member) {
            member = intr.member as GuildMember;
        }


        let presenseString;
        console.log(member.presence);
        switch (member.presence?.status ?? "offline") {
            case "online":
                presenseString = `Online ${client.emotes.statuses.online}`;
                break;

            case "offline":
                presenseString = `Offline ${client.emotes.statuses.offline}`;
                break;

            case "idle":
                presenseString = `Idle ${client.emotes.statuses.idle}`;
                break;

            case "dnd":
                presenseString = `DnD ${client.emotes.statuses.dnd}`;
                break;

            case "invisible":
                presenseString = `Invisible ${client.emotes.statuses.invisible}`;
                break;

        }

        let roles = `**${member.roles.cache
            .filter((r) => r.id !== intr.guild?.id)
            .map((r) => `<@&${r.id}>`).join(" ")
        }**`;

        if (roles === "****") {
            roles = "No Roles";
        }

        if (roles.length > 256) {
            roles = "Too many roles to name";
        }

        const permsArray = member.permissions.toArray();
        let perms = `${permsArray
            .map((p) => `${p
                .charAt(0)
                .toUpperCase()}${p.toLowerCase()
                .slice(1)
                .replace(/_/g, " ")}`)}`
            .replace(/,/g, ", ");
        if (perms === "") {
            perms = "No Perms";
        }

        const joinGuildTimestamp = client.timestampParse(member.joinedTimestamp?.toString() ?? "");
        const joinTimestamp = client.timestampParse(member.user.createdTimestamp.toString());
        const av = member.user.displayAvatarURL({ dynamic: true });

        return client.embedReply(intr, { embed: {
            author: { name: member.user.tag, iconURL: av },
            thumbnail: { url: av },
            description: `**${member}** (**${member.user.id}**)\n`
            + `**[📛] Tag** ][ ${member.user.tag}\n`
            + `**[🌐] Presence** ][ ${presenseString}\n\n`
            + `**[📆] Joined ${intr.guild?.name} at** <t:${joinGuildTimestamp}:F> about <t:${joinGuildTimestamp}:R>\n`
            + `**[📃] Joined Discord at** <t:${joinTimestamp}:F> about <t:${joinTimestamp}:R>\n`,
            fields: [
                { name: "[🧮] Roles", value: roles },
                { name: "[📰] Permissions", value: perms }

            ]
        } });

    }
};