/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { ButtonInteraction, EmbedFieldData, Message, MessageActionRow, MessageButton, MessageEmbedOptions } from "discord.js";
import { Command } from "../../interfaces";

export const command: Command = {
    description: "Get a list of all my commmands!",
    example: ["!help", "!help <commandName>"],
    group: "Utility",
    name: "help",
    run: async ( client, msg, args) => {

        let searchCMD = true;

        if (args.length === 0) searchCMD = false;

        switch (searchCMD) {
            case false: {

                const commands = client.arrayPage([...client.commands.values()], 4, 1);

                if (commands.length === 0) {
                    return client.embedReply(msg, { embed: { description: "There are currently no commads, there must be an error on the dev's side!" } });
                }

                let finalPage = 1;
                let notMax = false;
                while (!notMax) {
                    const cmds = client.arrayPage([...client.commands.values()], 4, finalPage);
                    if (cmds.length !== 0) {
                        finalPage++;
                    } else {
                        notMax = true;
                    }
                }
                finalPage -= 1;


                let fields: EmbedFieldData[] = [];
                commands.forEach(async (cmd) => {

                    let aliases = "";

                    if (cmd.aliases !== undefined) aliases = `> **Aliases:** ${cmd.aliases.map((a) => `\`${a}\``)}`;

                    fields.push({
                        name: client.capitalize(cmd.name), value: `${`> **Description:** ${cmd.description} \n`
                            + `> **Group:** ${client.capitalize(cmd.group)}\n`
                            + `> **Example usage:** ${cmd.example.map((a) => `\`${a}\``).join(", ")}\n`}${aliases}`
                    });

                });


                let embed: MessageEmbedOptions = {};
                const guildicon = msg.guild?.iconURL({ dynamic: true }) ?? "";

                function embedCreator(funcEmbed: MessageEmbedOptions, funcMsg: Message, funcFields: EmbedFieldData[], funcPage: number): void {
                    funcEmbed.author = { name: funcMsg.author.tag, iconURL: funcMsg.author.displayAvatarURL({ dynamic: true }) };
                    funcEmbed.title = `${client.user?.tag}'s ${client.commands.size} Commands`;
                    funcEmbed.footer = { text: `Page ${funcPage} / ${finalPage}` };
                    funcEmbed.thumbnail = { url: guildicon };
                    funcEmbed.timestamp = funcMsg.createdTimestamp;
                    funcEmbed.fields = funcFields;
                    funcEmbed.color = msg.guild?.me?.displayHexColor;

                }

                embedCreator(embed, msg, fields, 1);

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
                if (finalPage === 1) return client.embedReply(msg, { embed });

                const listMsg = await client.embedReply(msg, { embed, components });
                fields = [];
                embed = {};

                const filter = (button: ButtonInteraction): boolean => {
                    return msg.author.id === button.user.id && button.message.id === listMsg.id;
                };


                const collector = listMsg.createMessageComponentCollector({ "componentType": "BUTTON", idle: 30000, dispose: true, filter });
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


                            const frdPageList: Command[] = client.arrayPage([...client.commands.values()], 4, page);

                            frdPageList.forEach(async (cmd) => {

                                let aliases = "";

                                if (cmd.aliases !== undefined) aliases = `> **Aliases:** ${cmd.aliases.map((a) => `\`${a}\``)}`;

                                fields.push({
                                    name: client.capitalize(cmd.name), value: `${`> **Description:** ${cmd.description} \n`
                                        + `> **Group:** ${client.capitalize(cmd.group)}\n`
                                        + `> **Example usage:** ${cmd.example.map((a) => `\`${a}\``).join(", ")}\n`}${aliases}`
                                });

                            });


                            embedCreator(embed, msg, fields, page);

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

                            const bkwPageList: Command[] = client.arrayPage([...client.commands.values()], 4, page);


                            bkwPageList.forEach(async (cmd) => {


                                let aliases = "";

                                if (cmd.aliases !== undefined) aliases = `> **Aliases:** ${cmd.aliases.map((a) => `\`${a}\``)}`;

                                fields.push({
                                    name: client.capitalize(cmd.name), value: `${`> **Description:** ${cmd.description} \n`
                                        + `> **Group:** ${client.capitalize(cmd.group)}\n`
                                        + `> **Example usage:** ${cmd.example.map((a) => `\`${a}\``).join(", ")}\n`}${aliases}`
                                });

                            });


                            embedCreator(embed, msg, fields, page);

                            await butIntr.update({ embeds: [embed], components });
                            embed = {};
                            fields = [];
                            break;

                        }
                        default: {
                            await client.embedReply(msg, { embed: { description: "There was an error" } });
                        }
                    }
                });

                collector.on("end", async () => {
                    try {
                        await listMsg.edit({ components: [] });
                        const delMsg = await client.embedReply(listMsg, { embed: { description: "The page timed out" } });
                        await client.wait(5000);
                        await delMsg.delete();
                    } catch (err) { }
                });

                break;

            }

            case true: {

                const cmd = [...client.commands.values()].find((c) => {
                    if (c.aliases !== undefined) {
                        const alias = c.aliases.findIndex((a) => a === args[0]);

                        if (alias === -1) {
                            return c.name === args[0];
                        }

                        return c.aliases[alias];

                    }
                    return c.name === args[0];
                });

                // Const cmd = client.commands.get(args[0]);
                const embed: MessageEmbedOptions = {};

                if (cmd === undefined) {
                    embed.title = "Command not found";
                    embed.timestamp = msg.createdTimestamp;
                    return client.embedReply(msg, { embed }).then(() => {
                        if (msg.deletable) return msg.delete();
                    });

                }

                let aliases = "";

                if (cmd.aliases !== undefined) aliases = `\n> \n> **Aliases:** ${cmd.aliases.map((a) => `\`${a}\``)}`;

                embed.title = `${client.capitalize(cmd.name)}'s Details`;
                embed.timestamp = msg.createdTimestamp;
                embed.description =
                    `> **Description:** ${cmd.description}\n> \n`
                    + `> **Group:** ${client.capitalize(cmd.group)}\n> \n`
                    + `> **Example Usage:** ${cmd.example.map((a) => `\`${a}\``).join(", ")}`
                    + `${aliases}`;


                return client.embedReply(msg, { embed }).then(() => {
                    if (msg.deletable) return msg.delete();
                });

            }
        }
    }
};
