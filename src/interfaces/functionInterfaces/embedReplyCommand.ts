import { MessageActionRow, MessageAttachment, MessageEmbed, MessageEmbedOptions, MessageOptions, WebhookMessageOptions } from "discord.js";

export interface EmbedReplyEmbedArguments {
    components?: MessageActionRow[];
    content?: string;
    embed: MessageEmbedOptions | MessageEmbed;
    ephemeral?: boolean;
    files?: MessageAttachment[];
    mention?: boolean;
    options?: MessageOptions | WebhookMessageOptions;
}
