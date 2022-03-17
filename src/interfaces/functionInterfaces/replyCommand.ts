import { MessageActionRow, MessageAttachment, MessageEmbed, MessageEmbedOptions, MessageMentionOptions, MessageOptions, WebhookMessageOptions } from "discord.js";

export interface ReplyEmbedArguments {
    components?: MessageActionRow[];
    content?: string;
    embeds?: MessageEmbed[] | MessageEmbedOptions[];
    ephemeral?: boolean;
    files?: MessageAttachment[];
    mention?: MessageMentionOptions;
    options?: MessageOptions | WebhookMessageOptions;
}
