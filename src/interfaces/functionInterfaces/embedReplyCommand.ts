import { MessageActionRow, MessageAttachment, MessageEmbed, MessageEmbedOptions, MessageMentionOptions, MessageOptions, WebhookMessageOptions } from "discord.js";

export interface EmbedReplyEmbedArguments {
    components?: MessageActionRow[];
    content?: string;
    embed: MessageEmbedOptions | MessageEmbed;
    ephemeral?: boolean;
    files?: MessageAttachment[];
    mention?: MessageMentionOptions;
    options?: MessageOptions | WebhookMessageOptions;
}
