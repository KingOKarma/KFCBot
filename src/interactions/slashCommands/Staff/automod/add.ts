import { CommandInteraction, Message } from "discord.js";
import { DBGuild } from "../../../../entity/guild";
import ExtendedClient from "../../../../client/client";
import { Repository } from "typeorm";

export async function add(client: ExtendedClient, intr: CommandInteraction, dbGuild: DBGuild, guildRepo: Repository<DBGuild>): Promise<void | Message> {

    const setting = intr.options.getString("settings") ?? "null";
    const word = intr.options.getString("value") ?? "null";


    switch (setting) {

        case "word": {
            const words = dbGuild.bannedWords;
            if (words.includes(word)) return client.commandFailed(intr, `**${word}** is already on the blacklisted words list!`);

            dbGuild.bannedWords.push(word);
            await guildRepo.save(dbGuild);
            return client.reply(intr, { content: `I have added **${word}** to the automod blackwords list!`, ephemeral: true });


        }
        case "link": {
            if (!word.includes(".")) return client.commandFailed(intr, "Please make sure your links are formmated by domains, such as `example.com`, `example.xyz/kfc` ");

            const words = dbGuild.bannedLinks;
            if (words.includes(word)) return client.commandFailed(intr, `\`${word}\` is already on the blacklisted links list!`);

            dbGuild.bannedLinks.push(word);
            await guildRepo.save(dbGuild);
            return client.reply(intr, { content: `I have added \`${word}\` to the automod blackwords list!`, ephemeral: true });

        }

        default: {
            return client.commandFailed(intr, "Unable to find Settings please try again.");
        }

    }


}
