import { CommandInteraction, Message } from "discord.js";

export async function commandFailed(msg: Message | CommandInteraction, customError?: string): Promise<void | Message> {

    const baseMsg = "There was an error when executing the command";

    if (customError) {
        baseMsg.concat(`\n${baseMsg}`);
    }

    if (msg instanceof Message) {
        return msg.reply({ content: baseMsg });

    }
    return msg.reply({ content: baseMsg, ephemeral: true });


}
