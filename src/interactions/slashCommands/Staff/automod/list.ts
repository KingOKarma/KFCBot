import { CommandInteraction, Message } from "discord.js";
import { DBGuild } from "../../../../entity/guild";
import ExtendedClient from "../../../../client/client";

export async function list(client: ExtendedClient, intr: CommandInteraction, dbGuild: DBGuild): Promise<void | Message> {

    const setting = intr.options.getString("settings") ?? "null";
    let page = intr.options.getInteger("page") ?? 1;

    if (page <= 0) page = 1;


    switch (setting) {

        case "word": {

            if (dbGuild.bannedWords.length === 0) return client.commandFailed(intr, "The list is empty.\n> You can add banned words/phrases via \`/automod add\`");

            const words = client.arrayPage(dbGuild.bannedWords, 10, page);

            let finalPage = 1;
            let notMax = false;
            while (!notMax) {
                const cmds = client.arrayPage(dbGuild.bannedWords, 10, finalPage);
                if (cmds.length !== 0) {
                    finalPage++;
                } else {
                    notMax = true;
                }
            }
            finalPage -= 1;

            if (page > finalPage) page = finalPage;

            const mappedWords = words.map((w) => `> ${w}`);
            return client.reply(intr, { content: `List of Automodable words/phrases, Page **${page}**\n${mappedWords.join("\n")}`, ephemeral: true });

        }
        case "link": {


            if (dbGuild.bannedLinks.length === 0) return client.commandFailed(intr, "The list is empty.\n> You can add banned domains via \`/automod add\`");

            const words = client.arrayPage(dbGuild.bannedLinks, 10, page);

            let finalPage = 1;
            let notMax = false;
            while (!notMax) {
                const cmds = client.arrayPage(dbGuild.bannedLinks, 10, finalPage);
                if (cmds.length !== 0) {
                    finalPage++;
                } else {
                    notMax = true;
                }
            }
            finalPage -= 1;

            if (page > finalPage) page = finalPage;

            const mappedWords = words.map((w) => `> \`-\` \`${w}\``);
            return client.reply(intr, { content: `List of Automodable domains, Page **${page}**\n${mappedWords.join("\n")}`, ephemeral: true });

        }

        default: {
            return client.commandFailed(intr, "Unable to find Settings please try again.");
        }

    }

}
