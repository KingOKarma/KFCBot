import { ColorResolvable, CommandInteraction, Message, MessageEmbed } from "discord.js";
import { EmbedReplyEmbedArguments } from "../../interfaces";
import ExtendedClient from "../client";

export async function embedReply(msg: Message | CommandInteraction, { content, ephemeral, embed, components, files, options, mention }: EmbedReplyEmbedArguments, client: ExtendedClient): Promise<Message> {


    let colour = client.primaryColour;
    const cGuild = client.guildCache.get(msg.guildId ?? "");

    if (cGuild) {
        colour = cGuild.primaryColour as ColorResolvable;
    }

    if (msg instanceof Message) {
        if (ephemeral === true) console.log("Ephemeral messages can only be used with / commands");

        return msg.reply({
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
                }],
            files,
            options

        });
    }

    await msg.reply({
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
    return await msg.fetchReply() as Message;

}
