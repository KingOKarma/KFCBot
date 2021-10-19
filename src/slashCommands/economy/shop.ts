import { ILike, getRepository } from "typeorm";
import { globalEmotes, slashCommandTypes } from "../../globals";
import { Guild } from "../../entity/guild";
import { ItemMeta } from "../../entity/item";
import { ButtonInteraction, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { SlashCommands } from "../../interfaces/slashCommands";
import { createGuild, createUser } from "../../utils/dbUtils";
import { User } from "../../entity/user";

export const slashCommand: SlashCommands = {
    description: "buy or list the items in the store",
    name: "shop",
    options: [
        {
            description: "get info on any item in the store",
            name: "info",
            options: [
                {
                    description: "the item you want to get info on",
                    name: "item",
                    required: true,
                    type: slashCommandTypes.string
                }
            ],
            type: slashCommandTypes.subCommand
        },
        {
            description: "view what items the store offers",
            name: "list",
            options: [
                {
                    description: "the page to start on",
                    name: "page",
                    type: slashCommandTypes.number
                }
            ],
            type: slashCommandTypes.subCommand
        },
        {
            description: "buy an item",
            name: "buy",
            options: [
                {
                    description: "item you want to buy",
                    name: "item",
                    type: slashCommandTypes.string
                }
            ],
            type: slashCommandTypes.subCommand
        }
    ],
    async run (client, ir): Promise<void> {
        if (!ir.guild)
            return ir.reply({ content: "can only be used in guild", ephemeral: true });

        const command = ir.options.getSubcommand(true);

        const itemRepo = getRepository(ItemMeta);
        const guildRepo = getRepository(Guild);

        await ir.deferReply({ ephemeral: true });


        switch (command) {
            case "info": {
                const itemName = ir.options.getString("item");
                const item = await itemRepo.findOne({ name: ILike(`%${itemName}%`) });

                if (itemName === null) {
                    return void ir.editReply("lists are still a work in progress");
                }

                if (!item)
                    return void ir.editReply({ content: "this item doesnt exist please make sure that its the EXACT name" });

                let guildicon = ir.guild.iconURL({ dynamic: true });
                if (guildicon === null) {
                    guildicon = "";
                }

                const embed = new MessageEmbed();
                embed.setColor("BLUE");
                embed.setAuthor(ir.user.tag, ir.user.displayAvatarURL({ dynamic: true }));
                embed.setTitle(`${ir.guild.name}'s Item Info`);
                embed.addField("Name", `${item.name}`, true);
                embed.addField("Description", `${item.description}`, true);
                embed.addField("Price", `${item.price} ${globalEmotes.chickenNuggie} Nuggie(s)`, true);
                embed.addField("Stock left", `${item.stock !== -1 ? item.stock : "infinate"}`, true);
                embed.addField("ID", `${item.id}`, true);

                embed.setFooter("If there is a problem with an item please report it's ID number to the dev");
                embed.setThumbnail(guildicon);

                return void ir.editReply({ embeds: [embed] });

            }

            case "list": {
                const pageNum = 0;
                const itemsPerPage = 5;
                let guild = await guildRepo.findOne({ relations: ["items"], where: { serverid: ir.guildId } });

                if (!guild) {
                    guild = await createGuild(ir.guild, guildRepo);
                }

                if (guild.items.length > 1)
                    return void ir.editReply("this guild doesnt have any items to sell, try and ask the admin to create some");

                const embed = new MessageEmbed()
                    .setTitle("shop items")
                    .setAuthor(guild.name, guild.icon);

                const items = await itemRepo.find({ skip: pageNum * pageNum, take: itemsPerPage, where: { guild } });

                items.forEach((item) => {
                    embed.addField("Name", `${item.name}`, true);
                    embed.addField("Description", `${item.description}`, true);
                    embed.addField("Price", `${item.price} ${globalEmotes.chickenNuggie} Nuggie(s)`, true);
                    embed.addField("Stock left", `${item.stock !== -1 ? item.stock : "infinate"}`, true);
                    embed.addField("ID", `${item.id}`, true);
                });

                return void ir.editReply({ embeds: [embed] });

            }

            case "buy": {
                const itemName = ir.options.getString("item", true);
                const item = await getRepository(ItemMeta).findOne({ where: { name: ILike(`%${itemName}%`) } });
                const userRepo = getRepository(User);
                const user = await userRepo.findOne({ where: { uid: ir.user.id } });

                if (!user) {
                    void ir.editReply("you dont have enough nuggies to buy that item");
                    void createUser(ir, userRepo);
                    return;
                } else if (!item) {
                    void ir.editReply("couldnt find an item with that name");
                    return;
                } else if (user.nuggies < item.price) {
                    void ir.editReply("you dont have enough nuggies to buy that item, make sure that the name is correct");
                    return;
                } else if (item.stock === 0) {
                    void ir.editReply("that item is no longer in stock");
                }

                const confirmButton = new MessageButton()
                    .setCustomId("confirmPurchase")
                    .setLabel("confirm purchase")
                    .setStyle("PRIMARY");

                const row = new MessageActionRow().addComponents(confirmButton);

                const confirmEmbed = new MessageEmbed()
                    .setTitle("Warning!")
                    .setDescription(`You're about to buy ${item.name}. \n youre balance afterwads will be ${user.nuggies - item.price}`);

                await ir.editReply({ components: [row], embeds: [confirmEmbed] });

                const filter = (i: ButtonInteraction ): boolean => i.customId === "confirmPurchase" && ir.user.id !== i.user.id;

                const collector = ir.channel?.createMessageComponentCollector({ filter, time: 3e5 });

                collector?.once("collect", async (i) => {
                    if (item.stock !== -1)
                        item.stock -= 1;

                    user.nuggies -= item.price;
                    user.items.push(item.name);

                    void i.reply({ content: "congrats on your new item", ephemeral: true });
                });


            }
        }
    }
};