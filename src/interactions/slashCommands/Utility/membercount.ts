import { EmbedFieldData } from "discord.js";
import { SlashCommands } from "../../../interfaces/slashCommands";
import { slashCommandTypes } from "../../../globals";

export const slashCommand: SlashCommands = {
    description: "Count how many users, bots and total users are in a server",
    group: "Utility",
    guildOnly: true,
    name: "membercount",
    options: [
        {
            name: "type",
            description: "What type of search are you making",
            choices: [
                { name: "humans", value: "human" },
                { name: "bots", value: "bot" }

            ],
            type: slashCommandTypes.string
        }
    ],
    run: async ({ client, intr }) => {

        const fetchedUsers = await intr.guild?.members.fetch();

        if (!fetchedUsers) return client.embedReply(intr, { embed: { description: "Could not find any users (?)" } });

        const realuser = fetchedUsers.filter((member) => !member.user.bot).size;
        const botuser = fetchedUsers.filter((member) => member.user.bot).size;

        const type = intr.options.getString("type");

        let fields: EmbedFieldData[] = [
            { name: "\u200b", value: `Humans - **${realuser}**` },
            { name: "\u200b", value: `Bots - **${botuser}**` }
        ];

        if (type === "human") {
            fields = [
                { name: "\u200b", value: `Humans - **${realuser}**` }
            ];
        }
        if (type === "bot") {
            fields = [
                { name: "\u200b", value: `Bots - **${botuser}**` }
            ];
        }


        return client.embedReply(intr, { embed: {
            title: "Member Count",
            thumbnail: { url: intr.guild?.iconURL({ dynamic: true }) ?? "" },
            description: `The currently **${intr.guild?.name}** has **${intr.guild?.memberCount}** total members!`,
            fields
        } });

    }
};