import { SlashCommands } from "../../../interfaces/slashCommands";
import { inspect } from "util";
import { slashCommandTypes } from "../../../globals";

export const slashCommand: SlashCommands = {
    defaultPermission: false,
    description: "evaluate js code",
    devOnly: true,
    name: "eval",
    options: [
        {
            description: "what to evalutate",
            name: "code",
            required: true,
            type: slashCommandTypes.string
        }
    ],
    async run (client, ir) {
        await ir.deferReply();
        const code = ir.options.getString("code", true);

        const doReply = async (val: string | unknown): Promise<unknown> => {
            if (val instanceof Error) {
                return void ir.editReply({
                    embeds: [{
                        color: "RED",
                        fields: [
                            { name: "Input", value: `\`\`\`js\n${code}\`\`\`` },
                            { name: "Output", value: `\`\`\`js\n${val.message}\`\`\`` }
                        ]
                    }]
                });
            }
            return void ir.editReply({
                embeds: [{
                    color: "GREEN",
                    fields: [
                        { name: "Input", value: `\`\`\`js\n${code}\`\`\`` },
                        { name: "Output", value: `\`\`\`js\n${val}\`\`\`` }
                    ]
                }]
            });


        };

        try {
            let evaled = inspect(eval(code));
            if (typeof evaled !== "string")
                evaled = inspect(evaled);
            evaled = evaled.replace(`${client.token}`, "\"NICE TRY LMAO\"");
            if (evaled.length > 1024) {
                return void ir.editReply("too long output");
            }
            void doReply(evaled);

        } catch (e) {
            void doReply(e);
        }
    }
};
