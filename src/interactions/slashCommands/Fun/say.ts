import { SlashCommands } from "../../../interfaces/slashCommands";
import { slashCommandTypes } from "../../../globals";

export const slashCommand: SlashCommands = {
    description: "Say anything!",
    group: "Fun",
    name: "say",
    options: [
        {
            description: "What will I be saying",
            name: "message",
            required: true,
            type: slashCommandTypes.string
        }
        // {
        //     description: "any files you'd like to go along with the message",
        //     name: "attachements",
        //     type: slashCommandTypes.attachment
        // }
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async ({ client, intr }) => {

        const args = intr.options.getString("message");

        // const attachments = intr.options.get("attachements");

        // console.log(attachments);
        await intr.deferReply();
        await intr.channel?.send({ content: args, allowedMentions: { parse: ["users"] } });
        return intr.deleteReply();
    }
};
