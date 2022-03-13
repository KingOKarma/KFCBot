import { SlashCommands } from "../../../interfaces/slashCommands";
import { slashCommandTypes } from "../../../globals";

export const slashCommand: SlashCommands = {
    description: "Shows an emote as an image",
    group: "Media",
    name: "emote",
    permissionsBot: ["EMBED_LINKS"],
    options: [
        {
            name: "emote",
            description: "The emote to \"image'ify\"",
            type: slashCommandTypes.string,
            required: true
        }
    ],

    run: async ({ client, intr }) => {

        const e = intr.options.getString("emote") ?? "none";

        const emote = client.getEmote(e);

        if (emote === null) {
            return client.embedReply(intr, { embed: { description: "Please only send an emote from a server that I'm in" } });
        }
        let ending = "png";

        if (emote.animated) {
            ending = "gif";
        }
        return client.embedReply(intr, {
            embed:
            {
                image:
                    { url: `https://cdn.discordapp.com/emojis/${emote.id}.${ending}?size4096`, height: 4096, width: 4096 },
                title: emote.name ?? undefined,
                description: `Created on <t:${emote.createdTimestamp.toString().slice(0, -3)}:F>`
            }
        });
    }
};
