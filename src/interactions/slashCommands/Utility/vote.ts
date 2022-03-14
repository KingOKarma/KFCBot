import { CONFIG } from "../../../globals";
import { SlashCommands } from "../../../interfaces/slashCommands";
import fetch from "node-fetch";

export const slashCommand: SlashCommands = {
    description: "Help vote for the bot on Top.gg and raise us up the ranks!",
    group: "Utility",
    guildOnly: true,
    name: "vote",
    run: async ({ client, intr }) => {

        let topgg = "";

        const headers: HeadersInit = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "Authorization": CONFIG.tokens.topGGAuth.topGGKey
        };
        try {
            const res = await fetch("https://top.gg/api/bots/614110037291565056", { headers } );


            if (res.status !== 200) throw new Error(`Status Failed with code ${res.status}`);

            const body = await res.json();

            topgg = topgg.concat(`\n\`\`\`Total Votes ${body.points}\nMonthly Votes ${body.monthlyPoints}\`\`\``);

        } catch (err) {
            console.log(err);
            topgg = "";
        }


        return client.embedReply(intr, { embed: {
            title: "Top.gg Voting",
            description: `${"If you want to vote for the bot on top.gg\n> [Click Here](https://top.gg/bot/614110037291565056/vote)\n"
            + "> You will recieve 4 Nuggie rep! 8 Nuggie rep on the weekends!"}${topgg}`
            // Maybe one day ):
            // image: { url: "https://top.gg/api/widget/614110037291565056.svg" }
        } });


    }
};