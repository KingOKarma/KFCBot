import { SlashCommands } from "../../../interfaces/slashCommands";

export const slashCommand: SlashCommands = {
    description: "Find out how to be cool with just one simple video",
    group: "Fun",
    name: "cool",

    run: async ({ client, intr }) => {

        return client.embedReply(intr, { embed: { description: "Wanna learn how to be cool?\n [Check out this very cool video! 😎](https://youtu.be/dQw4w9WgXcQ)" } });
    }
};
