import { BufferResolvable, FileOptions, MessageActionRow, MessageAttachment, MessageEmbed, MessageEmbedOptions, MessageOptions, WebhookMessageOptions } from "discord.js";
import { Stream } from "stream";

export interface ReplyEmbedArguments {
    components?: MessageActionRow[];
    content?: string;
    embeds?: MessageEmbed[] | MessageEmbedOptions[];
    ephemeral?: boolean;
    files?: Array<FileOptions | BufferResolvable | Stream | MessageAttachment>;
    mention?: boolean;
    options?: MessageOptions | WebhookMessageOptions;
}