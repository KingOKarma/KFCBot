import { CommandInteraction, Message } from "discord.js";
import { DBGuild } from "../../../../entity/guild";
import ExtendedClient from "../../../../client/client";
import { Repository } from "typeorm";

export async function remove(client: ExtendedClient, intr: CommandInteraction, dbGuild: DBGuild, guildRepo: Repository<DBGuild>): Promise<void | Message> {

    const setting = intr.options.getString("settings") ?? "null";
    const word = intr.options.getString("value") ?? "null";


    switch (setting) {

        case "word": {


            const index = dbGuild.bannedWords.indexOf(word);

            if (index === -1) return client.embedReply(intr, { embed: { description: `**${word}** is not on the blacklisted words list!` } });

            dbGuild.bannedWords.splice(index);
            await guildRepo.save(dbGuild);
            return client.embedReply(intr, { embed: { description: `I have removed **${word}** from the automod blackwords list!` }, ephemeral: true });

        }
        case "link": {


            if (!word.includes(".")) return client.embedReply(intr, { embed: { description: "Please make sure your links are formmated by domains, such as `example.com`, `example.xyz/kfc` " } });

            const index = dbGuild.bannedLinks.indexOf(word);

            if (index === -1) return client.embedReply(intr, { embed: { description: `\`${word}\` is not on the blacklisted links list!` } });

            dbGuild.bannedLinks.splice(index);
            await guildRepo.save(dbGuild);
            return client.embedReply(intr, { embed: { description: `I have removed \`${word}\` from the automod blackwords list!` }, ephemeral: true } );

        }

        default: {
            return client.embedReply(intr, { embed: { description: "Unable to find Settings please try again." } });
        }

    }

}
