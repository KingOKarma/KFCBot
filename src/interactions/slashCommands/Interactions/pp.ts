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
            const ranNum = Math.floor(Math.random() * (50 - -10 + 1)) + -10;

            let search = "big pp";
            if (ranNum <= 3) search = "small pp";

            const res = await fetch(
                `https://g.tenor.com/v1/search?q=${search}&key=${CONFIG.tokens.tenorAPI}&media_filter=minimal&contentfilter=low`
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
                description = `You, **${member.displayName}** have a slong which is ${ranNum}"!`;
            } else {
                description = `**${member.displayName}** has ${ranNum}" on their mushroom`;
            }

            if (member.user.id === client.user?.id) {
                description = "Mine? That's a secret...";
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
