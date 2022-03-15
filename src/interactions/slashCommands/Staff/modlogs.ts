import { ButtonInteraction, ColorResolvable, CommandInteraction, EmbedFieldData, MessageActionRow, MessageButton, MessageEmbedOptions } from "discord.js";
import { DBUser } from "../../../entity/user";
import { ModLogs } from "../../../entity/modlogs";
import { SlashCommands } from "../../../interfaces/slashCommands";
import { getRepository } from "typeorm";
import { slashCommandTypes } from "../../../globals";

export const slashCommand: SlashCommands = {
    description: "Check the previous logs of users in the server",
    group: "Staff",
    guildOnly: true,
    name: "modlogs",
    permissionsUser: ["KICK_MEMBERS"],
    options: [
        {
            name: "user",
            description: "User whos modlogs you wish to check",
            type: slashCommandTypes.user,
            required: true
        }
    ],
    run: async ({ client, intr }) => {

        const userRepo = getRepository(DBUser);
        const modLogsRepo = getRepository(ModLogs);

        const user = intr.options.getUser("user", true);

        let dbuser = await userRepo.findOne({ relations: ["userLogs"], where: { serverId: intr.guildId ?? "", uid: user.id } });

        if (!dbuser) {
            const newUser = new DBUser();
            newUser.uid = user.id;
            newUser.serverId = user.id;
            newUser.avatar = user.displayAvatarURL({ dynamic: true });
            newUser.tag = user.tag;
            newUser.nuggies = 1;
            await userRepo.save(newUser);
            dbuser = newUser;
        }
        const logs = await modLogsRepo.findOne({ serverid: intr.guildId ?? "", uid: user.id, user: dbuser });

        if (!logs) {
            return client.embedReply(intr, { embed: { description: `**${user.tag}** has no logs` } });
        }

        const fullLogs = dbuser.userLogs;

        const logsPaged: ModLogs[] = client.arrayPage(fullLogs, 15, 1);

        if (logsPaged.length === 0) {
            return client.embedReply(intr, { embed: { description: `**${user.tag}** has no logs` } });
        }

        let finalPage = 1;
        let notMax = false;
        while (!notMax) {
            const cmds = client.arrayPage(fullLogs, 15, finalPage);
            if (cmds.length !== 0) {
                finalPage++;
            } else {
                notMax = true;
            }
        }
        finalPage -= 1;

        const cachedGuild = client.guildCache.get(intr.guildId ?? "");
        const av = user.displayAvatarURL({ dynamic: true });
        let fields: EmbedFieldData[] = [];
        let embed: MessageEmbedOptions = {};

        logsPaged.forEach((userlogs) => {
            fields.push({
                name: "\u200b",
                value: `**Case#${userlogs.id}** ][ **${userlogs.type}**\n**Moderator** ${userlogs.modTag} `
                    + `(<@${userlogs.modID}>)\n**Time:** at <t:${userlogs.time}:F> about <t:${userlogs.time}:R>\n**Reason** ${client.trimString(userlogs.reason, 4000)}`
            });

        });


        function embedCreator(funcEmbed: MessageEmbedOptions, funcintr: CommandInteraction, funcFields: EmbedFieldData[], funcPage: number): void {
            funcEmbed.description = `${user}'s (**${user.tag}**) logs for **${funcintr.guild?.name}**`;
            funcEmbed.author = { name: user.tag, iconURL: av };
            funcEmbed.thumbnail = { url: av };
            funcEmbed.footer = { text: `Page ${funcPage} / ${finalPage}` };
            funcEmbed.fields = funcFields;
            funcEmbed.color = cachedGuild?.primaryColour as ColorResolvable;

        }

        embedCreator(embed, intr, fields, 1);

        const fwdPage = new MessageButton();
        const bkwPage = new MessageButton();

        fwdPage.setCustomId("modlogs-list-frw");
        fwdPage.setEmoji("▶️");
        fwdPage.setStyle("PRIMARY");

        bkwPage.setCustomId("modlogs-list-bkw");
        bkwPage.setEmoji("◀️");
        bkwPage.setStyle("PRIMARY");
        bkwPage.setDisabled(true);


        const actionRow = new MessageActionRow().setComponents(bkwPage, fwdPage);
        const components = [actionRow];
        if (finalPage === 1) return client.embedReply(intr, { embed });

        const listintr = await client.embedReply(intr, { embed, components });
        fields = [];
        embed = {};

        const filter = (button: ButtonInteraction): boolean => {
            return intr.user.id === button.user.id && button.message.id === listintr.id;
        };

        const collector = listintr.createMessageComponentCollector({ "componentType": "BUTTON", idle: 30000, dispose: true, filter });
        let page = 1;
        collector.on("collect", async (butIntr) => {

            switch (butIntr.customId) {
                case "modlogs-list-frw": {
                    if (page + 1 <= 1) {
                        bkwPage.setDisabled(true);

                    } else bkwPage.setDisabled(false);

                    if (finalPage <= page + 1) {
                        fwdPage.setDisabled(true);
                    } else fwdPage.setDisabled(false);
                    page++;


                    const frdPageList: ModLogs[] = client.arrayPage(fullLogs, 15, page);

                    frdPageList.forEach(async (userlogs) => {
                        fields.push({
                            name: "\u200b",
                            value: `**Case#${userlogs.id}** ][ **${userlogs.type}**\n**Moderator** ${userlogs.modTag} `
                                + `(<@${userlogs.modID}>)\n**Time:** at <t:${userlogs.time}:F> about <t:${userlogs.time}:R>\n**Reason** ${client.trimString(userlogs.reason, 4000)}`
                        });


                    });


                    embedCreator(embed, intr, fields, page);

                    await butIntr.update({ embeds: [embed], components });
                    embed = {};
                    fields = [];
                    break;


                }
                case "modlogs-list-bkw": {

                    if (page - 1 <= 1) {
                        bkwPage.setDisabled(true);

                    } else bkwPage.setDisabled(false);

                    if (finalPage <= page - 1) {
                        fwdPage.setDisabled(true);
                    } else fwdPage.setDisabled(false);

                    page--;

                    const bkwPageList: ModLogs[] = client.arrayPage(fullLogs, 15, page);


                    bkwPageList.forEach(async (userlogs) => {

                        fields.push({
                            name: "\u200b",
                            value: `**Case#${userlogs.id}** ][ **${userlogs.type}**\n**Moderator** ${userlogs.modTag} `
                                + `(<@${userlogs.modID}>)\n**Time:** at <t:${userlogs.time}:F> about <t:${userlogs.time}:R>\n**Reason** ${client.trimString(userlogs.reason, 4000)}`
                        });


                    });


                    embedCreator(embed, intr, fields, page);

                    await butIntr.update({ embeds: [embed], components });
                    embed = {};
                    fields = [];
                    break;

                }
                default: {
                    await client.embedReply(intr, { embed: { description: "There was an error" }, ephemeral: true });
                }
            }
        });

        collector.on("end", async () => {
            try {
                await listintr.edit({ components: [] });
            } catch (err) { }
        });
    }
};
