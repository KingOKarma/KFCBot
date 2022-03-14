import { SlashCommands } from "../../../interfaces/slashCommands";
import fetch from "node-fetch";
export const slashCommand: SlashCommands = {
    description: "Get a dad joke from https://icanhazdadjoke.com/slack",
    group: "Fun",
    name: "dadjoke",

    run: async ({ client, intr }) => {

        try {
            const res = await fetch(
                "https://icanhazdadjoke.com/slack",
                {
                    headers: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        "User-Agent": "My Library (https://github.com/username/repo) https://icanhazdadjoke.com/"
                    }
                }
            );

            if (res.status !== 200) {
                throw new Error(`Received a ${res.status} status code`);
            }

            const body = await res.json();
            return await client.embedReply(intr, { embed: { description: body.attachments[0].text } });
        } catch (err) {
            return client.embedReply(intr, { embed: { description: `Command failed due to\n> ${err}` } });
        }

    }
};
