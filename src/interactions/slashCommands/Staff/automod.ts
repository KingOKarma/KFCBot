import { add, list, remove } from "./automod/index";
import { DBGuild } from "../../../entity/guild";
import { SlashCommands } from "../../../interfaces/slashCommands";
import { getRepository } from "typeorm";
import { slashCommandTypes } from "../../../globals";
import { toggle } from "./automod/toggle";

export const slashCommand: SlashCommands = {
    description: "Change the Server's Settings with Automod",
    group: "Staff",
    guildOnly: true,
    name: "automod",
    options: [
        {
            description: "Adds an automod setting",
            name: "add",
            options: [
                {
                    choices: [
                        {
                            name: "word",
                            value: "word"
                        },
                        {
                            name: "link",
                            value: "link"
                        }
                    ],

                    description: "What setting are you changing?",
                    name: "settings",
                    required: true,
                    type: slashCommandTypes.string
                },

                {
                    description: "What value is being added to your setting",
                    name: "value",
                    required: true,
                    type: slashCommandTypes.string
                }
            ],
            type: slashCommandTypes.subCommand
        },
        {
            description: "Removes an automod setting",
            name: "remove",
            options: [
                {
                    choices: [
                        {
                            name: "word",
                            value: "word"
                        },
                        {
                            name: "link",
                            value: "link"
                        }
                    ],

                    description: "What setting are you changing?",
                    name: "settings",
                    required: true,
                    type: slashCommandTypes.string
                },

                {
                    description: "What value is being added to your setting",
                    name: "value",
                    required: true,
                    type: slashCommandTypes.string
                }
            ],
            type: slashCommandTypes.subCommand
        },
        {
            description: "Lists any automodable settings",
            name: "list",
            options: [
                {
                    choices: [
                        {
                            name: "word",
                            value: "word"
                        },
                        {
                            name: "link",
                            value: "link"
                        }
                    ],

                    description: "What setting are you listing?",
                    name: "settings",
                    required: true,
                    type: slashCommandTypes.string
                },
                {
                    description: "Which page are you looking for?",
                    name: "page",
                    type: slashCommandTypes.integer
                }
            ],
            type: slashCommandTypes.subCommand
        },
        {
            description: "Is Automod Enabled or Disabled?",
            name: "toggle",
            options: [
                {
                    description: "Is Automod enabled",
                    name: "enabled",
                    type: slashCommandTypes.boolean
                }
            ],
            type: slashCommandTypes.subCommand
        }
    ],
    permissionsBot: ["MANAGE_ROLES"],
    permissionsUser: ["MANAGE_GUILD"],
    run: async ({ client, intr }) => {

        const { guild } = intr;
        if (guild === null) return client.commandFailed(intr, "This command can only be ran in guilds");

        const guildRepo = getRepository(DBGuild);
        let dbGuild = await guildRepo.findOne({ where: { serverid: intr.guildId } });

        if (!dbGuild) {
            const newGuild = new DBGuild();
            newGuild.serverid = intr.guildId ?? "";
            newGuild.name = intr.guild?.name ?? "Null Name";
            await guildRepo.save(newGuild);
            dbGuild = newGuild;
        }

        switch (intr.options.getSubcommand()) {
            case "add": {

                if (!dbGuild.automodEnabled) return client.reply(intr, { content: "The Automod module is disabled, please re-enable it with \`/automod toggle true\`", ephemeral: true });
                return add(client, intr, dbGuild, guildRepo);
            }

            case "remove": {

                if (!dbGuild.automodEnabled) return client.reply(intr, { content: "The Automod module is disabled, please re-enable it with \`/automod toggle true\`", ephemeral: true });
                return remove(client, intr, dbGuild, guildRepo);
            }

            case "list": {

                if (!dbGuild.automodEnabled) return client.reply(intr, { content: "The Automod module is disabled, please re-enable it with \`/automod toggle true\`", ephemeral: true });
                return list(client, intr, dbGuild);
            }

            case "toggle": {

                return toggle(client, intr);
            }

            default: {
                return client.reply(intr, { content: "There was an error when executing the command", ephemeral: true });
            }
        }

    }
};
