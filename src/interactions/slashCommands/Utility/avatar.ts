import { SlashCommands } from "../../../interfaces/slashCommands";
import { slashCommandTypes } from "../../../globals";

export const slashCommand: SlashCommands = {
    description: "Allows you to find an avatar of any user in the same server",
    group: "Utility",
    guildOnly: true,
    name: "avatar",
    options: [
        {
            description: "Which user avatar are you looking for",
            name: "user",
            type: slashCommandTypes.user
        }
    ],
    run: async ({ client, intr }) => {


        let user = intr.options.getUser("user");

        if (!user) ({ user } = intr);

        return client.embedReply(intr, {
            embed: {
                image: {
                    url: user.displayAvatarURL({
                        dynamic: true, size: 4096
                    })
                },
                description: `${user}\n${user.tag}`
            }
        });


    }
};