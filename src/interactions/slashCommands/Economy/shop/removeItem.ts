import { CommandInteraction, Message, MessageEmbedOptions } from "discord.js";
import { DBGuild } from "../../../../entity/guild";
import ExtendedClient from "../../../../client/client";
import { ItemMeta } from "../../../../entity/item";
import { getRepository } from "typeorm";

export async function removeItem(client: ExtendedClient, intr: CommandInteraction): Promise<Message> {

    const itemsDB = getRepository(ItemMeta);
    const guildDB = getRepository(DBGuild);

    const itemName = intr.options.getString("item-name") ?? "";

    const guild = await guildDB.findOne({ relations: ["shop"], where: { serverid: intr.guildId } });
    const items = await itemsDB.findOne({ where: { guild, name: itemName } });

    if ((guild?.shop.length ?? 0) === 0) {
        return client.embedReply(intr, { embed: { description: "The shop is currently empty please ask someone with \"Manage Server\" permissions to run `/shop additem`" } });
    }

    if (items) {
        await itemsDB.delete(items);


    } else {
        return client.embedReply(intr, { embed: { description: `**${itemName}** Does not exist, Please make sure the name is exactly the same as what is in \`/shop list\`` } });

    }


    const guildicon = intr.guild?.iconURL({ dynamic: true }) ?? "";


    const embed: MessageEmbedOptions = {};
    embed.author = { name: intr.user.tag, iconURL: intr.user.displayAvatarURL( { dynamic: true }) };
    embed.title = `${intr.guild?.name}'s removed item!`;
    embed.thumbnail = { url: guildicon };
    embed.description = `**${items.name}** was Removed`;

    return client.embedReply(intr, { embed });

}
