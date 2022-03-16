import { DBGuild } from "../../../entity/guild";
import { DBUser } from "../../../entity/user";
import { Inventory } from "../../../entity/inventory";
import { ItemMeta } from "../../../entity/item";
import { SlashCommands } from "../../../interfaces/slashCommands";
import { getRepository } from "typeorm";
import { slashCommandTypes } from "../../../globals";


export const slashCommand: SlashCommands = {
    // Note aliases are optional
    description: "Buy anything from the server shop!",
    group: "Economy",
    name: "buy",
    options: [
        {
            description: "Which item do you want to buy",
            name: "item-name",
            type: slashCommandTypes.string,
            required: true
        }
    ],
    guildOnly: true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async ({ client, intr }) => {


        const userRepo = getRepository(DBUser);
        const itemsRepo = getRepository(ItemMeta);
        const invRepo = getRepository(Inventory);
        const guildRepo = getRepository(DBGuild);


        const itemName = intr.options.getString("item-name") ?? "empty";


        const guild = await guildRepo.findOne({ where: { serverid: intr.guildId } });
        let user = await userRepo.findOne({ where: { serverId: intr.guildId, uid: intr.user.id } });
        const item = await itemsRepo.findOne({ where: { guild, name: itemName } });
        const inv = await invRepo.findOne({ where: { serverid: intr.guildId, uid: intr.user.id } });

        if (!item) {
            return client.embedReply(intr, { embed: { description: `**${itemName}** doesn't exist in the shop, try again with the exact name from the \`/shop list\`!` }, ephemeral: true });
        }

        if (!user) {
            const newUser = new DBUser();
            newUser.uid = intr.user.id;
            newUser.serverId = intr.guildId ?? "";
            newUser.avatar = intr.user.displayAvatarURL({ dynamic: true });
            newUser.tag = intr.user.tag;
            newUser.nuggies = 0;
            await userRepo.save(newUser);
            user = newUser;
        }

        if (user.nuggies < item.price) {
            return client.embedReply(intr, { embed: { description: `You don't have enough nuggies for **${item.name}**!` }, ephemeral: true });
        }

        if (item.max === 0) {
            return client.embedReply(intr, {
                embed: {
                    description: `Sorry there are no more **${itemName}'s** left in stock!` +
                    "\nPlease ask a server manager to add to the stock with `/shop addstock`!" +
                    "```diff\n- OUT OF STOCK```"
                }
            }
            );
        }

        if (!inv) {
            const newInv = new Inventory();
            newInv.serverid = intr.guildId ?? "";
            newInv.uid = intr.user.id;
            newInv.user = user;
            newInv.items = [item.name];
            await invRepo.save(newInv);

        } else {
            inv.items.push(item.name);
            await invRepo.save(inv);
        }


        user.nuggies -= item.price;
        item.max -= 1;
        await userRepo.save(user);
        await itemsRepo.save(item);

        const guildicon = intr.guild?.iconURL({ dynamic: true }) ?? "";

        return client.embedReply(intr, { embed:
            {
                thumbnail: { url: guildicon },
                title: "Buy",
                author: { name: user.tag, iconURL: intr.user.displayAvatarURL( { dynamic: true }) },
                description: `${intr.user} just bought **${itemName}**, You can find it with \`/inventory\`!`,
                footer: { text: "You can use `/inv` to check what items you have" },
                timestamp: intr.createdTimestamp
            } });

    }
};
