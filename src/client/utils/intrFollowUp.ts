import { ColorResolvable, CommandInteraction, Message, MessageEmbed } from "discord.js";
import { EmbedReplyEmbedArguments } from "../../interfaces";
import ExtendedClient from "../client";

export async function intrFollowUp(intr: CommandInteraction, { content, ephemeral, embed, components, files, options, mention }: EmbedReplyEmbedArguments, client: ExtendedClient): Promise<Message> {


    let colour = client.primaryColour;
    const cGuild = client.guildCache.get(intr.guildId ?? "");

    if (cGuild) {
        colour = cGuild.primaryColour as ColorResolvable;
    }


    await intr.followUp({
        allowedMentions: mention ?? undefined,
        components,
        content: content ?? undefined,
        embeds: embed instanceof MessageEmbed ? [embed] :
            [{
                "author": embed.author,
                "color": embed.color ?? colour,
                "description": embed.description,
                "fields": embed.fields,
                "footer": embed.footer,
                "image": embed.image,
                "thumbnail": embed.thumbnail,
                "timestamp": embed.timestamp,
                "title": embed.title,
                "url": embed.url,
                "video": embed.video
            }], ephemeral,
        files,
        options

    });
    return await intr.fetchReply() as Message;

}
