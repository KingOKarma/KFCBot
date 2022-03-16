import { ButtonInteraction, ColorResolvable, CommandInteraction, EmbedFieldData, MessageActionRow, MessageButton, MessageEmbedOptions } from "discord.js";
import { DBGuild } from "../../../entity/guild";
import { DBUser } from "../../../entity/user";
import { Inventory } from "../../../entity/inventory";
import { ItemMeta } from "../../../entity/item";
import { SlashCommands } from "../../../interfaces/slashCommands";
import { getRepository } from "typeorm";


export const slashCommand: SlashCommands = {
    description: "Display's what items are in your inventory",
    group: "Economy",
    guildOnly: true,
    name: "inventory",
    run: async ({ client, intr, dbGuild }) => {

        const invRepo = getRepository(Inventory);
        const itemsRepo = getRepository(ItemMeta);
        const userRepo = getRepository(DBUser);
        const guildRepo = getRepository(DBGuild);

        let user = await userRepo.findOne({ where: { serverId: intr.guildId, uid: intr.user.id } });

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

        const inventory = await invRepo.findOne({ where: { user, uid: intr.user.id, serverid: intr.guildId } });

        const guild = await guildRepo.findOne({ where: { serverid: intr.guildId } });

        if (!inventory) {
            return client.embedReply(intr, { embed: { description: "You have no items in your inventory, you can buy them from the server shop!" } });
        }

        if (!guild) {
            return client.embedReply(intr, { embed: { description: "A shop has not been setup in this server, please ask a server manager to do so" } });
        }

        const itemsPaged: string[] = client.arrayPage(inventory.items, 9, 1);

        if (itemsPaged.length === 0) {
            return client.embedReply(intr, { embed: { description: "You have no items in your inventory, you can buy them from the server shop!" } });
        }

        let finalPage = 1;
        let notMax = false;
        while (!notMax) {
            const cmds = client.arrayPage(inventory.items, 9, finalPage);
            if (cmds.length !== 0) {
                finalPage++;
            } else {
                notMax = true;
            }
        }
        finalPage -= 1;

        const guildicon = intr.guild?.iconURL({ dynamic: true }) ?? "";

        let fields: EmbedFieldData[] = [];
        await new Promise<void>((resolve) => {
            itemsPaged.forEach(async (i, index, arr) => {

                const itemInfo = await itemsRepo.findOne({ guild, name: i });
                if (!itemInfo) {

                    fields.push({ name: `${i}`, value: "Item No longer exists in shop." });
                    if (index === arr.length - 1) resolve();
                } else {

                    fields.push({ name: `${i}`, value: itemInfo.description });
                    if (index === arr.length - 1) resolve();

                }

            });

        });


        let embed: MessageEmbedOptions = {};

        function embedCreator(funcEmbed: MessageEmbedOptions, funcIntr: CommandInteraction | ButtonInteraction, funcFields: EmbedFieldData[], funcPage: number): void {
            funcEmbed.author = { name: funcIntr.user.tag, iconURL: funcIntr.user.displayAvatarURL({ dynamic: true }) };
            funcEmbed.title = `${funcIntr.user.username}'s Server Shop`;
            funcEmbed.footer = { text: `Page ${funcPage} / ${finalPage}` };
            funcEmbed.thumbnail = { url: guildicon };
            funcEmbed.timestamp = funcIntr.createdTimestamp;
            funcEmbed.fields = funcFields;
            funcEmbed.color = dbGuild?.primaryColour as ColorResolvable | undefined ?? client.primaryColour;

        }

        embedCreator(embed, intr, fields, 1);

        const fwdPage = new MessageButton();
        const bkwPage = new MessageButton();

        fwdPage.setCustomId("inv-list-frw");
        fwdPage.setEmoji("▶️");
        fwdPage.setStyle("PRIMARY");

        bkwPage.setCustomId("inv-list-bkw");
        bkwPage.setEmoji("◀️");
        bkwPage.setStyle("PRIMARY");
        bkwPage.setDisabled(true);


        const actionRow = new MessageActionRow().setComponents(bkwPage, fwdPage);
        const components = [actionRow];
        if (finalPage === 1) return client.embedReply(intr, { embed });

        const listMsg = await client.embedReply(intr, { embed, components });
        fields = [];
        embed = {};


        const filter = (button: ButtonInteraction): boolean => {
            return intr.user.id === button.user.id && button.message.id === listMsg.id;
        };


        const collector = listMsg.createMessageComponentCollector({ "componentType": "BUTTON", idle: 30000, dispose: true, filter });
        let page = 1;
        collector.on("collect", async (butIntr) => {

            switch (butIntr.customId) {
                case "inv-list-frw": {
                    if (page + 1 <= 1) {
                        bkwPage.setDisabled(true);

                    } else bkwPage.setDisabled(false);

                    if (finalPage <= page + 1) {
                        fwdPage.setDisabled(true);
                    } else fwdPage.setDisabled(false);
                    page++;


                    const frdPageList: string[] = client.arrayPage(inventory.items, 9, page);


                    await new Promise<void>((resolve) => {
                        frdPageList.forEach(async (i, index, arr) => {

                            const itemInfo = await itemsRepo.findOne({ guild, name: i });
                            if (!itemInfo) {

                                fields.push({ name: `${i}`, value: "Item No longer exists in shop." });
                                if (index === arr.length - 1) resolve();
                            } else {

                                fields.push({ name: `${i}`, value: itemInfo.description });
                                if (index === arr.length - 1) resolve();

                            }

                        });

                    });

                    embedCreator(embed, butIntr, fields, page);


                    await butIntr.update({ embeds: [embed], components });
                    embed = {};
                    fields = [];
                    break;


                }
                case "inv-list-bkw": {

                    if (page - 1 <= 1) {
                        bkwPage.setDisabled(true);

                    } else bkwPage.setDisabled(false);

                    if (finalPage <= page - 1) {
                        fwdPage.setDisabled(true);
                    } else fwdPage.setDisabled(false);

                    page--;

                    const bkwPageList: string[] = client.arrayPage(itemsPaged, 9, page);


                    await new Promise<void>((resolve) => {
                        bkwPageList.forEach(async (i, index, arr) => {

                            const itemInfo = await itemsRepo.findOne({ guild, name: i });
                            if (!itemInfo) {

                                fields.push({ name: `${i}`, value: "Item No longer exists in shop." });
                                if (index === arr.length - 1) resolve();
                            } else {

                                fields.push({ name: `${i}`, value: itemInfo.description });
                                if (index === arr.length - 1) resolve();

                            }

                        });

                    });

                    embedCreator(embed, butIntr, fields, page);

                    await butIntr.update({ embeds: [embed], components });
                    embed = {};
                    fields = [];
                    break;

                }
                default: {
                    return intr.deleteReply();
                }
            }
        });

        collector.on("end", async () => {
            try {
                await listMsg.edit({ components: [] });
                await client.intrFollowUp(intr, { embed: { description: "The page timed out" }, ephemeral: true });

            } catch (err) {}
        });


    }
};
