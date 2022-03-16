import { DBUser } from "../../../entity/user";
import { Inventory } from "../../../entity/inventory";
import { MessageEmbedOptions } from "discord.js";
import { SlashCommands } from "../../../interfaces/slashCommands";
import { getRepository } from "typeorm";
import { slashCommandTypes } from "../../../globals";


export const slashCommand: SlashCommands = {
    // Note aliases are optional
    description: "Use any item from your inventory",
    group: "Economy",
    name: "use",
    guildOnly: true,
    options: [{
        type: slashCommandTypes.string,
        name: "item-name",
        description: "The name of the item use (Must be exact)",
        required: true
    }],
    run: async ({ client, intr }) => {


        const userRepo = getRepository(DBUser);
        const invRepo = getRepository(Inventory);


        let user = await userRepo.findOne({ serverId: intr.guildId ?? "", uid: intr.user.id });
        const inv = await invRepo.findOne({ serverid: intr.guildId ?? "", uid: intr.user.id });

        if (!user) {
            const newUser = new DBUser();
            newUser.uid = intr.user.id;
            newUser.serverId = intr.guildId ?? "";
            newUser.avatar = intr.user.displayAvatarURL({ dynamic: true });
            newUser.tag = intr.user.tag;
            newUser.nuggies = 1;
            await userRepo.save(newUser);
            user = newUser;
        }

        if (!inv) {
            return client.embedReply(intr, { embed: { description: "You have no items in your inventory, you can buy them from the server shop!" } });
        }

        const itemName = intr.options.getString("item-name") ?? "";

        const index = inv.items.findIndex((i) => i === itemName);
        if (index === -1) return client.embedReply(intr, {
            embed: {
                description: `**${itemName}** does not exist, please make sure it's spelled the same as what is displyed in \`/inventory\``
            }, ephemeral: true
        });

        inv.items.splice(index, 1);
        await invRepo.save(inv);


        const guildicon = intr.guild?.iconURL({ dynamic: true }) ?? "";


        const embed: MessageEmbedOptions = {

            thumbnail: { url: guildicon },
            title: `${intr.user.username}'s ${itemName} receipt`,
            author: { name: intr.user.tag, iconURL: intr.user.displayAvatarURL({ dynamic: true }) },
            description: `**${itemName}** was used by ${intr.user} (${intr.user.id}) in **${intr.guild?.name}** (${intr.guildId})`,
            footer: { text: "You can use /inventory to check what other items you have" },
            timestamp: intr.createdTimestamp
        };
        return client.embedReply(intr, { embed });

    }
};
