import { ButtonInteraction, ColorResolvable, CommandInteraction, MessageActionRow, MessageButton, MessageEmbedOptions } from "discord.js";
import { DBUser } from "../../../entity/user";
import { SlashCommands } from "../../../interfaces/slashCommands";
import { getRepository } from "typeorm";
import { slashCommandTypes } from "../../../globals";


export const slashCommand: SlashCommands = {
    description: "Displays the leaderboard for either the XP list or the Economy list!",
    group: "Economy",
    guildOnly: true,
    name: "leaderboard",
    options: [
        {
            name: "type",
            type: slashCommandTypes.string,
            description: "Choose either \"XP\" or \"Economy\" to get the respected leaderboards",
            choices: [{ name: "XP", value: "XP" }, { name: "Economy", value: "Economy" }],
            required: true
        }
    ],
    run: async ({ client, intr, dbGuild }) => {

        const userRepo = getRepository(DBUser);

        const typeOfLB = intr.options.getString("type") ?? "";
        let users: DBUser[] | undefined = undefined;
        if (typeOfLB === "XP") {
            users = await userRepo.find({
                order: { totalXp: "DESC" },
                where: [{ serverId: intr.guildId }]
            });


        } else {
            users = await userRepo.find({
                order: { nuggies: "DESC" },
                where: [{ serverId: intr.guildId }]
            });

        }

        const emote = client.currencyEmoji;
        const lb = users.map((u, index) => {
            // eslint-disable-next-line no-param-reassign
            return `\`-${index + 1}\` <@${u.uid}> Ø **${typeOfLB === "XP" ? `${u.totalXp}XP` : `${emote}${u.nuggies}`}**`;
        });
        const usersPaged: string[] = client.arrayPage(lb, 5, 1);

        let authorPost = users.find((user) => user.uid === intr.user.id);

        if (authorPost === undefined) {
            const newUser = new DBUser();
            newUser.uid = intr.user.id;
            newUser.serverId = intr.guildId ?? "";
            newUser.avatar = intr.user.displayAvatarURL({ dynamic: true });
            newUser.tag = intr.user.tag;
            newUser.xp = 0;
            await userRepo.save(newUser);
            authorPost = newUser;
        }

        const formmatedUser = `\`-${users.indexOf(authorPost) + 1}\` <@${authorPost.uid}> Ø `
        + ` **${typeOfLB === "XP" ? `${authorPost.totalXp}XP` : `${emote}${authorPost.nuggies}`}**`;


        if (usersPaged.length === 0)
            return client.embedReply(intr, { embed: { description: "There are no members on that page" }, ephemeral: true });


        let finalPage = 1;
        let notMax = false;
        while (!notMax) {
            const cmds = client.arrayPage(lb, 5, finalPage);
            if (cmds.length !== 0) {
                finalPage++;
            } else {
                notMax = true;
            }
        }
        finalPage -= 1;


        let embed: MessageEmbedOptions = {};
        const guildicon = intr.guild?.iconURL({ dynamic: true }) ?? "";

        function embedCreator(funcEmbed: MessageEmbedOptions, funcIntr: CommandInteraction | ButtonInteraction, funcDesc: string[], funcPage: number): void {
            funcEmbed.author = { name: funcIntr.user.tag, iconURL: funcIntr.user.displayAvatarURL({ dynamic: true }) };
            funcEmbed.title = `${funcIntr.guild?.name}'s ${typeOfLB} Leaderboard`;
            funcEmbed.description = `${formmatedUser}\n`
            + `\n${funcDesc.join("\n")}`;
            funcEmbed.footer = { text: `Page ${funcPage} / ${finalPage}` };
            funcEmbed.thumbnail = { url: guildicon };
            funcEmbed.timestamp = funcIntr.createdTimestamp;
            funcEmbed.color = dbGuild?.primaryColour as ColorResolvable | undefined ?? client.primaryColour;

        }

        embedCreator(embed, intr, usersPaged, 1);

        const fwdPage = new MessageButton();
        const bkwPage = new MessageButton();

        fwdPage.setCustomId("lb-list-frw");
        fwdPage.setEmoji("▶️");
        fwdPage.setStyle("PRIMARY");

        bkwPage.setCustomId("lb-list-bkw");
        bkwPage.setEmoji("◀️");
        bkwPage.setStyle("PRIMARY");
        bkwPage.setDisabled(true);


        const actionRow = new MessageActionRow().setComponents(bkwPage, fwdPage);
        const components = [actionRow];
        if (finalPage === 1) return client.embedReply(intr, { embed });

        const listMsg = await client.embedReply(intr, { embed, components });
        embed = {};

        const filter = (button: ButtonInteraction): boolean => {
            return intr.user.id === button.user.id && button.message.id === listMsg.id;
        };


        const collector = listMsg.createMessageComponentCollector({ "componentType": "BUTTON", idle: 30000, dispose: true, filter });
        let page = 1;
        collector.on("collect", async (butIntr) => {

            switch (butIntr.customId) {
                case "lb-list-frw": {
                    if (page + 1 <= 1) {
                        bkwPage.setDisabled(true);

                    } else bkwPage.setDisabled(false);

                    if (finalPage <= page + 1) {
                        fwdPage.setDisabled(true);
                    } else fwdPage.setDisabled(false);
                    page++;


                    const frdPageList: string[] = client.arrayPage(lb, 5, page);

                    embedCreator(embed, butIntr, frdPageList, page);


                    await butIntr.update({ embeds: [embed], components });
                    embed = {};
                    break;


                }
                case "lb-list-bkw": {

                    if (page - 1 <= 1) {
                        bkwPage.setDisabled(true);

                    } else bkwPage.setDisabled(false);

                    if (finalPage <= page - 1) {
                        fwdPage.setDisabled(true);
                    } else fwdPage.setDisabled(false);

                    page--;

                    const bkwPageList: string[] = client.arrayPage(lb, 5, page);

                    embedCreator(embed, butIntr, bkwPageList, page);

                    await butIntr.update({ embeds: [embed], components });
                    embed = {};
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
