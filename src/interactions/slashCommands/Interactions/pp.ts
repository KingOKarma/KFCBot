import { CONFIG, slashCommandTypes } from "../../../globals";
import { GuildMember } from "discord.js";
import { SlashCommands } from "../../../interfaces/slashCommands";
import { TenorGifResponse } from "../../../types/globalTypes";
import fetch from "node-fetch";

export const slashCommand: SlashCommands = {
    description: "Check out yours and other user's PP size",
    group: "Interactions",
    name: "pp",
    options: [
        {
            description: "The user you are checking pp for",
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
                `https://g.tenor.com/v1/search?q=anime kids&key=${CONFIG.tokens.tenorAPI}&media_filter=minimal&contentfilter=low`
            );

            if (res.status !== 200) {
                throw new Error(`Received a ${res.status} status code`);
            }

            const body = (await res.json()).results as TenorGifResponse[];

            const random = body[Math.floor(Math.random() * body.length)];

            let member = intr.options.getMember("user") as GuildMember;

            let description;
            const footer = intr.options.getString("footer-msg") ?? undefined;
            const kidCount = Math.floor(Math.random() * (10000 - 0 + 1)) + 0;

            if (member.id === intr.user.id) {
                member = intr.member as GuildMember;
                description = `You, **${member.displayName}** will have ${kidCount} kids in the future!`;
            } else {
                description = `**${member.displayName}** will have ${kidCount} kids in the future!`;
            }

            if (member.user.id === client.user?.id) {
                description = `Well, I can't technically have kids,\nbut if I were to I'd say I'd have ${kidCount} kids in the future!`;
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
