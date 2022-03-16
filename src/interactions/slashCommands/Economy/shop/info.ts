import { CommandInteraction, Message, MessageEmbedOptions } from "discord.js";
import { DBGuild } from "../../../../entity/guild";
import ExtendedClient from "../../../../client/client";
import { ItemMeta } from "../../../../entity/item";
import { getRepository } from "typeorm";

export async function itemInfo(client: ExtendedClient, intr: CommandInteraction): Promise<void | Message> {
    const itemsDB = getRepository(ItemMeta);
    const guildDB = getRepository(DBGuild);

    const itemName = intr.options.getString("item-name") ?? "";

    const guild = await guildDB.findOne({ relations: ["shop"], where: { serverid: intr.guildId } });
    const items = await itemsDB.findOne({ where: { guild, name: itemName } });

    if ((guild?.shop.length ?? 0) === 0) {
        return client.embedReply(intr, { embed: { description: "The shop is currently empty please ask someone with \"Manage Server\" permissions to run `/shop additem`" } });
    }

    if (!items) return client.embedReply(intr, { embed: { description: `**${itemName}** Could not be found, please make sure that the name is the exact name that is shown on \`/shop list\`` } });


    const guildicon = intr.guild?.iconURL({ dynamic: true }) ?? "";

    const embed: MessageEmbedOptions = {};
    embed.author = { name: intr.user.tag, iconURL: intr.user.displayAvatarURL( { dynamic: true }) };
    embed.title = `${intr.guild?.name}'s ${itemName}`;
    embed.thumbnail = { url: guildicon };
    embed.description = `**Name**: ${items.name}\n**Description**:\n ${items.description}\n\n`
    + `**Price**: ${items.price} Nuggies\n**In Stock**: ${items.max}\n**Created by**: <@${items.userAdded}>\n **Created**: <t:${items.added}:R> at <t:${items.added}:f>`;

    return client.embedReply(intr, { embed });

}