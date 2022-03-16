import { ButtonInteraction, ColorResolvable, CommandInteraction, EmbedFieldData, Message, MessageActionRow, MessageButton, MessageEmbedOptions } from "discord.js";
import { DBGuild } from "../../../../entity/guild";
import ExtendedClient from "../../../../client/client";
import { ItemMeta } from "../../../../entity/item";
import { getRepository } from "typeorm";

export async function shopList(client: ExtendedClient, intr: CommandInteraction, dbGuild?: DBGuild): Promise<void | Message> {
    const guildRepo = getRepository(DBGuild);
    const guild = await guildRepo.findOne({ relations: ["shop"], where: { serverid: intr.guildId } });

    if (!guild) {
        return client.embedReply(intr, { embed: { description: "The shop is currently empty please ask someone with \"Manage Server\" permissions to run `/shop additem`" }, ephemeral: true });
    }

    const sortedShop = guild.shop.sort((a, b) => a.price - b.price);

    const iteamsPaged: ItemMeta[] = client.arrayPage(sortedShop, 5, 1);

    if (iteamsPaged.length === 0) {
        return client.embedReply(intr, { embed: { description: "The shop is currently empty please ask someone with \"Manage Server\" permissions to run `/shop additem`" }, ephemeral: true });
    }

    let finalPage = 1;
    let notMax = false;
    while (!notMax) {
        const cmds = client.arrayPage(sortedShop, 5, finalPage);
        if (cmds.length !== 0) {
            finalPage++;
        } else {
            notMax = true;
        }
    }
    finalPage -= 1;


    const guildicon = intr.guild?.iconURL({ dynamic: true }) ?? "";

    let embed: MessageEmbedOptions = {};
    let fields: EmbedFieldData[] = [];

    iteamsPaged.forEach((item) => {
        let text = `In Stock: ${item.max}`;
        if (item.max === 0) {
            text = "|| OUT OF STOCK ||";
        }
        fields.push({ name: item.name, value: `${item.description}\n\`\`\`Price: ${item.price} Nuggie(s)\n${text}\`\`\`` });
    });

    function embedCreator(funcEmbed: MessageEmbedOptions, funcIntr: CommandInteraction | ButtonInteraction, funcFields: EmbedFieldData[], funcPage: number): void {
        funcEmbed.author = { name: funcIntr.user.tag, iconURL: funcIntr.user.displayAvatarURL({ dynamic: true }) };
        funcEmbed.title = `${funcIntr.guild?.name}'s Server Shop`;
        funcEmbed.footer = { text: `Page ${funcPage} / ${finalPage}` };
        funcEmbed.thumbnail = { url: guildicon };
        funcEmbed.timestamp = funcIntr.createdTimestamp;
        funcEmbed.fields = funcFields;
        funcEmbed.color = dbGuild?.primaryColour as ColorResolvable | undefined ?? client.primaryColour;

    }

    embedCreator(embed, intr, fields, 1);

    const fwdPage = new MessageButton();
    const bkwPage = new MessageButton();

    fwdPage.setCustomId("shop-list-frw");
    fwdPage.setEmoji("▶️");
    fwdPage.setStyle("PRIMARY");

    bkwPage.setCustomId("shop-list-bkw");
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
            case "shop-list-frw": {
                if (page + 1 <= 1) {
                    bkwPage.setDisabled(true);

                } else bkwPage.setDisabled(false);

                if (finalPage <= page + 1) {
                    fwdPage.setDisabled(true);
                } else fwdPage.setDisabled(false);
                page++;


                const frdPageList: ItemMeta[] = client.arrayPage(sortedShop, 5, page);


                frdPageList.forEach((item) => {
                    let text = `In Stock: ${item.max}`;
                    if (item.max === 0) {
                        text = "|| OUT OF STOCK ||";
                    }
                    fields.push({ name: item.name, value: `${item.description}\n\`\`\`Price: ${item.price} Nuggie(s)\n${text}\`\`\`` });
                });

                embedCreator(embed, butIntr, fields, page);


                await butIntr.update({ embeds: [embed], components });
                embed = {};
                fields = [];
                break;


            }
            case "shop-list-bkw": {

                if (page - 1 <= 1) {
                    bkwPage.setDisabled(true);

                } else bkwPage.setDisabled(false);

                if (finalPage <= page - 1) {
                    fwdPage.setDisabled(true);
                } else fwdPage.setDisabled(false);

                page--;

                const bkwPageList: ItemMeta[] = client.arrayPage(sortedShop, 5, page);


                bkwPageList.forEach((item) => {
                    let text = `In Stock: ${item.max}`;
                    if (item.max === 0) {
                        text = "|| OUT OF STOCK ||";
                    }
                    fields.push({ name: item.name, value: `${item.description}\n\`\`\`Price: ${item.price} Nuggie(s)\n${text}\`\`\`` });
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