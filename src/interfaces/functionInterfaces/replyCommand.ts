import { MessageActionRow, MessageAttachment, MessageEmbed, MessageEmbedOptions, MessageOptions, WebhookMessageOptions } from "discord.js";

export interface ReplyEmbedArguments {
    components?: MessageActionRow[];
    content?: string;
    embeds?: MessageEmbed[] | MessageEmbedOptions[];
    ephemeral?: boolean;
    files?: MessageAttachment[];
    mention?: boolean;
    options?: MessageOptions | WebhookMessageOptions;
}