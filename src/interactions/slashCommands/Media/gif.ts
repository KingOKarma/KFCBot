import { CONFIG, slashCommandTypes } from "../../../globals";
import { SlashCommands } from "../../../interfaces/slashCommands";
import { TenorGifResponse } from "../../../types/globalTypes";
import fetch from "node-fetch";

export const slashCommand: SlashCommands = {
    description: "Search for any gif using a phrase, obtained from tenor.com",
    group: "Media",
    name: "gif",
    permissionsBot: ["EMBED_LINKS"],
    options: [
        {
            name: "search",
            description: "The phrase to help search for the gif",
            type: slashCommandTypes.string,
            required: true
        }
    ],

    run: async ({ client, intr }) => {

        const search = intr.options.getString("search");

        try {

            const res = await fetch(`https://g.tenor.com/v1/search?q=${search}&key=${CONFIG.tokens.tenorAPI}&media_filter=minimal&contentfilter=low`);

            if (res.status !== 200) {
                throw new Error(`Received a ${res.status} status code`);
            }

            const body = (await res.json()).results as TenorGifResponse[];

            const random = body[Math.floor(Math.random() * body.length)];

            return await client.embedReply(intr, { embed: { image: { url: random.media[0].gif.url } } });


        } catch (err) {
            return client.embedReply(intr, { embed: { description: `There was an error when preforming this command, Reason:\n${err}` } });
        }

    }
};
