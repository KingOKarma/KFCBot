import { SlashCommands } from "../../../interfaces/slashCommands";

export const slashCommand: SlashCommands = {
    description: "Receive an invite to add the bot to your own servers",
    group: "Utility",
    guildOnly: true,
    name: "invite",
    run: async ({ client, intr }) => {

        const invite = "https://discord.com/oauth2/authorize?client_id=614110037291565056&scope=bot%20applications.commands&permissions=8589934591";

        return client.embedReply(intr, { embed: {
            author: { name: client.user?.tag, iconURL: client.user?.displayAvatarURL({ dynamic: true }) },
            description: "You can invite Bucket Boy using the link below,\nIf you have any questions or suggestions you can head to the support server also linked below",
            fields: [
                { name: "Invite Me", value: `[Click Here](${invite})`, inline: true },
                { name: "Support Server", value: "[Click Here](https://support.bucketbot.dev)", inline: true }

            ]
        } });

    }
};