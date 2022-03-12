import { CommandInteraction, Message } from "discord.js";
import { ReplyEmbedArguments } from "../../interfaces";

export async function reply(msg: Message | CommandInteraction, { content, ephemeral, embeds, components, files, options, mention }: ReplyEmbedArguments): Promise<Message> {

    if (msg instanceof Message) {
        if (ephemeral === true) console.log("Ephemeral messages can only be used with / commands");
        return msg.reply({
            allowedMentions: mention ?? false ? { repliedUser: false } : undefined,
            components,
            content: content ?? undefined,
            embeds: embeds ? Array.isArray(embeds) ? embeds : [embeds] : undefined,
            files,
            options

        });
    }

    await msg.reply({
        allowedMentions: mention ?? false ? { repliedUser: false } : undefined,
        components,
        content: content ?? undefined,
        embeds: embeds ? Array.isArray(embeds) ? embeds : [embeds] : undefined,
        ephemeral,
        files,
        options

    });
    return await msg.fetchReply() as Message;

}