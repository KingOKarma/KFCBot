import { ColorResolvable, GuildTextBasedChannel } from "discord.js";
import { SlashCommands } from "../../../interfaces/slashCommands";
import { slashCommandTypes } from "../../../globals";

export const slashCommand: SlashCommands = {
    description: "Purge up to 100 messages in chat",
    group: "Staff",
    guildOnly: true,
    name: "purge",
    permissionsBot: ["MANAGE_MESSAGES"],
    permissionsUser: ["MANAGE_MESSAGES"],
    options: [
        {
            name: "amount",
            description: "How many messages are you purging",
            type: slashCommandTypes.number,
            required: true,
            maxValue: 100
        },
        {
            name: "user",
            description: "If you'd like to purge a certain user's Mesasges, please specify here",
            type: slashCommandTypes.user
        }
    ],
    run: async ({ client, intr }) => {

        const cachedGuild = client.guildCache.get(intr.guildId ?? "");
        const amount = intr.options.getNumber("amount", true);
        const user = intr.options.getUser("user");
        const channel = intr.channel as GuildTextBasedChannel;


        await client.embedReply(intr, { embed: { description: "Fetching your messages..." }, ephemeral: true });

        let fetched = [...(await channel.messages.fetch({ limit: user ? 100 : amount })).values()];

        if (user) {
            fetched = fetched.filter((msg) => msg.author.id === user.id).slice(0, amount);
        }

        await channel.bulkDelete(fetched)
            .catch(async (error) => client.embedReply(intr, { embed: { description: `Couldn't delete messages because of: ${error}` }, ephemeral: true }));

        await intr.editReply({
            embeds: [{
                description: `I Just purged ${fetched.length} messages${user ? ` From ${user}` : ""}`,
                color: cachedGuild?.primaryColour as ColorResolvable
            }]
        });


    }
};
