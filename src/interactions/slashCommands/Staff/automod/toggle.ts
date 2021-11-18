import { CommandInteraction, Message } from "discord.js";
import { DBGuild } from "../../../../entity/guild";
import ExtendedClient from "../../../../client/client";
import { getRepository } from "typeorm";

export async function toggle(client: ExtendedClient, intr: CommandInteraction): Promise<void | Message> {

    const toggleOption = intr.options.getBoolean("enabled");

    const guildRepo = getRepository(DBGuild);
    let dbGuild = await guildRepo.findOne({ where: { serverid: intr.guildId } });

    if (!dbGuild) {
        const newGuild = new DBGuild();
        newGuild.serverid = intr.guildId;
        newGuild.name = intr.guild?.name ?? "Null Name";
        await guildRepo.save(newGuild);
        dbGuild = newGuild;
    }

    switch (toggleOption) {

        case true: {

            dbGuild.automodEnabled = true;
            await guildRepo.save(dbGuild);
            return client.reply(intr, { content: "Enabled Automod", ephemeral: true });
        }

        case false: {

            dbGuild.automodEnabled = false;
            await guildRepo.save(dbGuild);
            return client.reply(intr, { content: "Disabled Automod", ephemeral: true });
        }

        default: {
            return client.reply(intr, { content: `Automod is currently ${dbGuild.automodEnabled ? "Enabled" : "Disabled"}`, ephemeral: true });

        }

    }

}
