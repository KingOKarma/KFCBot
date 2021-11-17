import { add, remove } from "./automod/index";
import { SlashCommands } from "../../../interfaces/slashCommands";
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
            description: "Is Automod Enabled or Disabled?",
            name: "toggle",
            options: [
                {
                    description: "Is Automod enabled",
                    name: "enabled",
                    required: true,
                    type: slashCommandTypes.boolean
                }
            ],
            type: slashCommandTypes.subCommand
        }
    ],
    permissionsBot: ["MANAGE_ROLES"],
    permissionsUser: ["MANAGE_GUILD"],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, intr) => {

        const { guild } = intr;
        if (guild === null) return client.commandFailed(intr, "This command can only be ran in guilds");


        switch (intr.options.getSubcommand()) {
            case "add": {

                return add(client, intr);
            }

            case "remove": {

                return remove(client, intr);
            }

            case "toggle": {

                return toggle(client, intr);
            }

            default: {
                return intr.reply({ content: "There was an error when executing the command", ephemeral: true });
            }
        }

    }
};
