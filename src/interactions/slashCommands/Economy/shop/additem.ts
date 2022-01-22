import { CommandInteraction, GuildMember, Message, MessageEmbedOptions } from "discord.js";
import { DBGuild } from "../../../../entity/guild";
import ExtendedClient from "../../../../client/client";
import { ItemMeta } from "../../../../entity/item";
import { getRepository } from "typeorm";


export async function addItem(client: ExtendedClient, intr: CommandInteraction): Promise<void | Message> {


    const { member } = intr;

    if (member instanceof GuildMember)
        if (!member.permissions.has("MANAGE_GUILD")) {
            return client.embedReply(intr, { embed: { description: "You need to have the \"Manage Server\" Permission to use this command!" } });
        }


    const itemsDB = getRepository(ItemMeta);
    const guildDB = getRepository(DBGuild);


    const itemName = intr.options.getString("item-name") ?? "none";
    const price = intr.options.getInteger("item-price") ?? 1;
    const stock = intr.options.getInteger("item-stock") ?? 1;
    const itemDesc = intr.options.getString("item-desc") ?? "No description given";


    let guild = await guildDB.findOne({ relations: ["shop"], where: { serverid: intr.guildId } });
    const items = await itemsDB.findOne({ guild, name: itemName });
    const newItem = new ItemMeta();


    if (!guild) {
        const newGuild = new DBGuild();
        newGuild.serverid = intr.guildId ?? "";
        newGuild.name = intr.guild?.name ?? "";
        newGuild.shop = [newItem];
        await guildDB.save(newGuild);
        guild = newGuild;
    }

    if (!guild.boosted && guild.shop.length >= 15) {
        return client.embedReply(intr, { embed: { description: "Sorry only boosted server can have more than 15 shop items!\n" +
            "For more information about server boosting please use `/boost`" } });
    }

    if (!items) {
        newItem.name = itemName;
        newItem.guild = guild;
        newItem.description = itemDesc;
        newItem.max = stock;
        newItem.price = price;
        newItem.userAdded = intr.user.id;
        newItem.added = intr.createdTimestamp.toString().substring(0, 10);

        await itemsDB.save(newItem);
    } else {
        return client.embedReply(intr, { embed: { description: `**${itemName}** is already on the shop. please use a different name` } });
    }

    const guildicon = intr.guild?.iconURL({ dynamic: true }) ?? "";


    const embed: MessageEmbedOptions = {};

    embed.author = { name: intr.user.tag, iconURL: intr.user.displayAvatarURL({ dynamic: true }) };
    embed.title = `${intr.guild?.name}'s new item!`;
    embed.thumbnail = { url: guildicon };
    embed.fields = [{ name: `${itemName}`, value: `${itemDesc}\n\`\`\`Price: ${price} Nuggie(s)\nIn Stock: ${price}\`\`\`` }];

    return client.embedReply(intr, { embed });
}
