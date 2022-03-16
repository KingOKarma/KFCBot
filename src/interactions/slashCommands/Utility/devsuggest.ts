import { MessageEmbedOptions, TextChannel } from "discord.js";
import { SlashCommands } from "../../../interfaces/slashCommands";
import { slashCommandTypes } from "../../../globals";

export const slashCommand: SlashCommands = {
    description: "Make any suggestion to the developers",
    group: "Utility",
    name: "devsuggest",
    options: [
        {
            description: "What would you like to suggest?",
            name: "suggestion",
            type: slashCommandTypes.string,
            required: true
        }
    ],
    run: async ({ client, intr }) => {

        try {
            const homeGuild = await client.getGuild(client.globalIds.guilds.supportGuild);

            const homeLogs = await homeGuild?.channels.fetch(client.globalIds.channels.kfcSuggestions) as TextChannel | undefined;

            if (!homeLogs) throw new Error("No suggestion channel found");

            const av = intr.user.displayAvatarURL({ dynamic: true });

            const description = `${intr.user} has suggested:\n`.concat(intr.options.getString("suggestion") ?? "");

            const embed: MessageEmbedOptions = {
                thumbnail: { url: av },
                author: { name: intr.user.tag, iconURL: av },
                title: "New Suggestion",
                description,
                color: client.primaryColour
            };
            await intr.deferReply();

            await intr.user.send({
                embeds: [
                    {
                        color: client.primaryColour,
                        description: `I have just sent your suggestion over to the [Support Server](https://support.bucketbot.dev), it can be viewed in <#${client.globalIds.channels.kfcSuggestions}>`
                    }]
            });
            await intr.deleteReply();
            return await homeLogs.send({ embeds: [embed] });

        } catch (err) {
            console.log(err);
            return client.embedReply(intr, { embed: { description: `There was an erorr when trying to send the suggestion. Reason:\n${err}` } });
        }
    }
};
