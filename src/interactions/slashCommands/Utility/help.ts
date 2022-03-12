import { ButtonInteraction, CommandInteraction, EmbedFieldData, MessageActionRow, MessageButton, MessageEmbedOptions } from "discord.js";
import { SlashCommands } from "../../../interfaces";
import { slashCommandTypes } from "../../../globals";

export const slashCommand: SlashCommands = {
    description: "Get a list of all the commands for the bot",
    group: "Utility",
    name: "help",
    options: [
        {

            description: "What command are you looking for?",
            name: "command",
            type: slashCommandTypes.string
        }
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async ({ client, intr }) => {


        let fullCommandList = [...client.slashCommands.values()];

        fullCommandList = fullCommandList.sort((a, b) => {
            if (a.group < b.group) {
                return -1;
            }
            if (a.group > b.group) {
                return 1;
            }
            return 0;
        }
        );

        const command = intr.options.getString("command");

        switch (!command) {
            case true: {

                const commands = client.arrayPage(fullCommandList, 4, 1);

                if (commands.length === 0) {
                    return client.embedReply(intr, { embed: { description: "There are currently no commads, there must be an error on the dev's side!" } });
                }

                let finalPage = 1;
                let notMax = false;
                while (!notMax) {
                    const cmds = client.arrayPage(fullCommandList, 4, finalPage);
                    if (cmds.length !== 0) {
                        finalPage++;
                    } else {
                        notMax = true;
                    }
                }
                finalPage -= 1;


                let fields: EmbedFieldData[] = [];
                commands.forEach(async (cmd) => {

                    let value = `${`> **Description:** ${cmd.description} \n`
                        + `> **Group:** ${client.capitalize(cmd.group)}`}`;

                    if (cmd.options) value = value.concat("\n> **Options**\n",
                        `${cmd.options.map((a) => `> \` ${a.name}\`\n> ${a.description}`).join("\n")}`
                    );

                    fields.push({
                        name: client.capitalize(cmd.name), value
                    });

                });


                let embed: MessageEmbedOptions = {};
                const guildicon = intr.guild?.iconURL({ dynamic: true }) ?? "";

                function embedCreator(funcEmbed: MessageEmbedOptions, funcintr: CommandInteraction, funcFields: EmbedFieldData[], funcPage: number): void {
                    funcEmbed.author = { name: funcintr.user.tag, iconURL: funcintr.user.displayAvatarURL({ dynamic: true }) };
                    funcEmbed.title = `${client.user?.tag}'s ${client.slashCommands.size} Commands`;
                    funcEmbed.footer = { text: `Page ${funcPage} / ${finalPage}` };
                    funcEmbed.thumbnail = { url: guildicon };
                    funcEmbed.timestamp = funcintr.createdTimestamp;
                    funcEmbed.fields = funcFields;
                    funcEmbed.color = intr.guild?.me?.displayHexColor;

                }

                embedCreator(embed, intr, fields, 1);

                const fwdPage = new MessageButton();
                const bkwPage = new MessageButton();

                fwdPage.setCustomId("help-list-frw");
                fwdPage.setEmoji("▶️");
                fwdPage.setStyle("PRIMARY");

                bkwPage.setCustomId("help-list-bkw");
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
                        case "help-list-frw": {
                            if (page + 1 <= 1) {
                                bkwPage.setDisabled(true);

                            } else bkwPage.setDisabled(false);

                            if (finalPage <= page + 1) {
                                fwdPage.setDisabled(true);
                            } else fwdPage.setDisabled(false);
                            page++;


                            const frdPageList: SlashCommands[] = client.arrayPage(fullCommandList, 4, page);

                            frdPageList.forEach(async (cmd) => {
                                let value = `${`> **Description:** ${cmd.description} \n`
                                    + `> **Group:** ${client.capitalize(cmd.group)}`}`;

                                if (cmd.options) value = value.concat("\n> **Options**\n",
                                    `${cmd.options.map((a) => `> \` ${a.name}\`\n> ${a.description}`).join("\n")}`
                                );

                                fields.push({
                                    name: client.capitalize(cmd.name), value
                                });


                            });


                            embedCreator(embed, intr, fields, page);

                            await butIntr.update({ embeds: [embed], components });
                            embed = {};
                            fields = [];
                            break;


                        }
                        case "help-list-bkw": {

                            if (page - 1 <= 1) {
                                bkwPage.setDisabled(true);

                            } else bkwPage.setDisabled(false);

                            if (finalPage <= page - 1) {
                                fwdPage.setDisabled(true);
                            } else fwdPage.setDisabled(false);

                            page--;

                            const bkwPageList: SlashCommands[] = client.arrayPage(fullCommandList, 4, page);


                            bkwPageList.forEach(async (cmd) => {

                                let value = `${`> **Description:** ${cmd.description} \n`
                                    + `> **Group:** ${client.capitalize(cmd.group)}`}`;

                                if (cmd.options) value = value.concat("\n> **Options**\n",
                                    `${cmd.options.map((a) => `> \` ${a.name}\`\n> ${a.description}`).join("\n")}`
                                );

                                fields.push({
                                    name: client.capitalize(cmd.name), value
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

                break;

            }

            case false: {

                const cmd = fullCommandList.find((c) => {
                    return c.name === command;
                });

                // Const cmd = client.slashCommands.get(command);
                const embed: MessageEmbedOptions = {};

                if (cmd === undefined) {
                    embed.title = `${command} Command not found`;
                    embed.timestamp = intr.createdTimestamp;
                    return client.embedReply(intr, { embed, ephemeral: true });

                }

                let options = "";

                if (cmd.options) options = options.concat("\n> **Options**\n",
                    `${cmd.options.map((a) => `> \` ${a.name}\`\n> ${a.description}`).join("\n")}`
                );

                embed.title = `${client.capitalize(cmd.name)}'s Details`;
                embed.timestamp = intr.createdTimestamp;
                embed.description =
                    `> **Description:** ${cmd.description}\n> \n`
                    + `> **Group:** ${client.capitalize(cmd.group)}`
                    + `${options}`;


                return client.embedReply(intr, { embed, ephemeral: true });


            }
        }


    }
};