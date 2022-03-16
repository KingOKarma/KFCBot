import { MessageActionRow, MessageAttachment, MessageButton, MessageEmbedOptions } from "discord.js";
import { Command } from "../../interfaces";

export const command: Command = {
    description: "Get a list of all my commmands!",
    example: ["!help", "!help <commandName>"],
    group: "Utility",
    name: "help",
    run: async ( client, msg) => {

        const invite = "https://discord.com/oauth2/authorize?client_id=614110037291565056&scope=bot%20applications.commands&permissions=8589934591";

        const embed: MessageEmbedOptions = {
            title: "⚠️ Commands becoming deprecated ⚠️",
            author: { name: client.user?.username, url: "https://bucketbot.dev", iconURL: client.user?.displayAvatarURL({ dynamic: true }) },
            description: "> Discord is *Forcing* all verified bots to move over to slash commands by April 2022, Because of this all of my"
            + " commands have been switched over to their / variant so we don't get lost in space and time!\n\n"
            + "**Slash commands are not appearing?**\n"
            + `> If the new slash commands are not appearing please kick and reinvite the bot using this [link](${invite}), If after that you or other users still cannot see the`
            + " commands please make sure that they have the `Use Application Commands` permission!\n\n"
            + "**How can I view a good list of these new commands?**\n"
            + "> You can use the new `/help` command to get a very nice list of commands using discord's new button feature!",
            footer: { iconURL: client.user?.displayAvatarURL({ dynamic: true }), text: "Welcome to V3 of bucket boy! I would love it if you considered using /vote It would really help us!" },
            timestamp: msg.createdTimestamp,
            image: { url: "attachment://howtoslash.png" }

        };

        const files = new MessageAttachment("./images/howtoslash.png");

        const supportButton = new MessageButton()
            .setURL("https://discord.gg/v6emjARDrp")
            .setStyle("LINK")
            .setLabel("Support Server");

        const invitebutton = new MessageButton()
            .setURL(invite)
            .setStyle("LINK")
            .setLabel("Invite Me");

        const actionRow = new MessageActionRow().setComponents(supportButton, invitebutton);
        const components = [actionRow];

        return client.embedReply(msg, { embed, files: [files], components });

    }
};
