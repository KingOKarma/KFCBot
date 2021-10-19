/* eslint-disable capitalized-comments */
import { ButtonInteraction, MessageActionRow, MessageButton } from "discord.js";
import { ILike, getRepository } from "typeorm";
import { Guild } from "../../entity/guild";
import { ItemMeta } from "../../entity/item";
import { SlashCommands } from "../../interfaces/slashCommands";
import { createGuild } from "../../utils/dbUtils";
import { slashCommandTypes } from "../../globals";

export const slashCommand: SlashCommands = {
    defaultPermission: false,
    description: "displays the server shop",
    guildOnly: true,
    name: "item",
    options: [
        {
            description: "add a new item to the shop",
            name: "add",
            options: [
                {
                    description: "the name of the new item",
                    name: "name",
                    required: true,
                    type: slashCommandTypes.string
                },
                {
                    description: "what should the items description be? its a describtion of a describtion... haha funny funny",
                    name: "description",
                    required: true,
                    type: slashCommandTypes.string
                },
                {
                    description: "the price of the item",
                    name: "price",
                    required: true,
                    type: slashCommandTypes.number
                },
                {
                    description: "the starting stock of this item set to -1 for infinate",
                    name: "stock",
                    required: true,
                    type: slashCommandTypes.number
                }
            ],
            type: slashCommandTypes.subCommand
        },
        {
            description: "remove an item from the shop",
            name: "remove",
            options: [
                {
                    description: "the item you want to be removed",
                    name: "item",
                    required:true,
                    type: slashCommandTypes.string
                }
            ],
            type: slashCommandTypes.subCommand
        },
        {
            description: "edit and exsisting item",
            name: "edit",
            options: [
                {
                    description: "the item to edit",
                    name: "item",
                    required: true,
                    type: slashCommandTypes.string
                },
                {
                    description: "edit the item pice",
                    name: "price",
                    type: slashCommandTypes.number
                },
                {
                    description: "edit the item stock",
                    name: "stock",
                    type: slashCommandTypes.number
                }
            ],
            type: slashCommandTypes.subCommand
        }
    ],
    async run (client, ir): Promise<void> {
        if (!ir.guild)
            return void ir.reply({ content: "can only be used in guild", ephemeral: true });

        const command = ir.options.getSubcommand(true);

        const guildRepo = getRepository(Guild);
        const itemRepo = getRepository(ItemMeta);

        let guild = await guildRepo.findOne({ where: { serverid: ir.guildId } });

        if (!guild) {
            guild = await createGuild(ir.guild, guildRepo);
        }

        await ir.deferReply({ ephemeral: true });
        switch (command) {

            case "add": {

                const desc = ir.options.getString("description", true);
                const name = ir.options.getString("name", true);
                const price = ir.options.getNumber("price", true);
                const stock = ir.options.getNumber("stock", true);

                const item = new ItemMeta();
                if (!Math.sign(price))
                    return void ir.editReply({ content: "prices cant be negative dummy" });

                item.description = desc;
                item.name = name;
                item.price = price;
                item.guild = guild;
                item.stock = stock;

                try {
                    await itemRepo.save(item);
                    await ir.editReply("the item was created");
                } catch (error) {
                    await ir.editReply({ content: "that item already exists. if you want to edit the item use /item edit" });
                }
                break;
            }

            case "remove": {
                const itemName = ir.options.getString("item", true);

                const item = await itemRepo.findOne({ name: ILike(`%${itemName}%`) });

                if (!item)
                    return void ir.editReply({ content: "this item doesnt exist please make sure that its the EXACT name" });

                // eslint-disable-next-line sort-keys
                await ir.editReply({ content: "do you wish to delete this item", components: [new MessageActionRow().addComponents(new MessageButton()
                    .setCustomId("confirm")
                    .setLabel("confirm")
                    .setStyle("DANGER"),
                new MessageButton()
                    .setCustomId("cancel")
                    .setLabel("cancel")
                    .setStyle("SECONDARY")
                )
                ] });

                const filter = ( i: ButtonInteraction ): boolean => i.customId === "confirm" || i.customId === "cancel" && i.user.id === ir.user.id;

                const collector = ir.channel?.createMessageComponentCollector({ filter, time: 3e5 });

                collector?.once("collect", async (i) => {
                    if (i.customId === "confirm") {
                        await i.reply({ content: "the item was deleted", ephemeral: true });
                        await itemRepo.delete(item);
                    } else if (i.customId === "cancel") {
                        await i.reply({ content: "didnt delete the item", ephemeral: true });
                    }
                });
                break;
            }

            case "edit": {
                const itemName = ir.options.getString("item", true);
                const price = ir.options.getNumber("price");
                const stock = ir.options.getNumber("stock");

                const item = await itemRepo.findOne({ where: { name: ILike(`%${itemName}%`) } });

                if (!item)
                    return void ir.editReply("that item doesnt exist. make sure you use the EXACT name");

                item.price = price ?? item.price;
                item.stock = stock ?? item.stock;

                await itemRepo.save(item);

                return void ir.editReply({ content: `${item.name }was updated` });
            }


            default:
                break;
        }

    }
};

