import { SlashCommands } from "../../../interfaces/slashCommands";
import fetch from "node-fetch";
import { slashCommandTypes } from "../../../globals";
import { stringify } from "querystring";

export const slashCommand: SlashCommands = {
    description: "Look for the definition of (almost) any word on the great urban dictionary",
    group: "Fun",
    name: "urban",
    options: [
        {
            name: "word",
            description: "The word you are looking to define",
            type: slashCommandTypes.string,
            required: true
        }
    ],

    run: async ({ client, intr }) => {

        const phrase = intr.options.getString("word") ?? "none";

        const query = stringify({ term: phrase });

        try {
            const { list } = await fetch(`https://api.urbandictionary.com/v0/define?${query}`).then(async (response) => response.json());
            const [answer] = list;

            if (list.length === 0) {
                return await client.embedReply(intr, { embed: { description: `No results found for \`${phrase}\`` } });
            }


            return await client.embedReply(intr, {
                embed: {
                    title: phrase, url: answer.permalink, fields: [
                        { name: "Definition", value: client.trimString(answer.definition, 1024) },
                        { name: "Example", value: client.trimString(answer.example, 1024) },
                        { name: "Rating", value: `${answer.thumbs_up} upvotes. ${answer.thumbs_down} downvotes.` }

                    ]
                }
            });

        } catch (err) {
            return client.embedReply(intr, { embed: { description: `There was an error during the command, Reason:\n${err}` } });
        }
    }
};
