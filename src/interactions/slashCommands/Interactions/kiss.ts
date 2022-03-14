import { CONFIG, slashCommandTypes } from "../../../globals";
import { GuildMember } from "discord.js";
import { SlashCommands } from "../../../interfaces/slashCommands";
import { TenorGifResponse } from "../../../types/globalTypes";
import fetch from "node-fetch";

export const slashCommand: SlashCommands = {
    description: "Kiss any user you may have in mind",
    group: "Interactions",
    name: "kiss",
    options: [
        {
            description: "The user you are kissing",
            name: "user",
            required: true,
            type: slashCommandTypes.user
        },
        {
            name: "footer-msg",
            description: "Any message you may like to add to the footer",
            type: slashCommandTypes.string
        }
    ],
    run: async ({ client, intr }) => {
        try {
            const res = await fetch(
                `https://g.tenor.com/v1/search?q=anime kiss&key=${CONFIG.tokens.tenorAPI}&media_filter=minimal&contentfilter=low`
            );

            if (res.status !== 200) {
                throw new Error(`Received a ${res.status} status code`);
            }

            const body = (await res.json()).results as TenorGifResponse[];

            const random = body[Math.floor(Math.random() * body.length)];

            let member = intr.options.getMember("user") as GuildMember;

            let description;
            const footer = intr.options.getString("footer-msg") ?? undefined;

            if (member.id === intr.user.id) {
                member = intr.member as GuildMember;
                description = `Looks like **${member.displayName}** is feeling lonley, I'll give them a lil smooch`;
            } else {
                description = `${(intr.member as GuildMember).displayName} just kissed **${member.displayName}**, Things must be getting tense`;
            }

            if (member.user.id === client.user?.id) {
                description = "O-oh? You want to kiss me? Well then... Pucker up!";
            }


            return await client.embedReply(intr, { embed: {
                description,
                image: { url: random.media[0].gif.url },
                footer: { text: footer }
            } });

        } catch (err) {
            console.log(err);
            return client.embedReply(intr, {
                embed: {
                    description: `There was an error when running the command. Reason:\n${err}`
                }
            });
        }
    }
};
