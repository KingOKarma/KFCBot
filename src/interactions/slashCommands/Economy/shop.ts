import { addItem, itemInfo, removeItem, shopList } from "./shop/";
import { SlashCommands } from "../../../interfaces/slashCommands";
import { slashCommandTypes } from "../../../globals";

export const slashCommand: SlashCommands = {
    description: "Interact with the shop of the server",
    group: "Economy",
    guildOnly: true,
    name: "shop",
    options: [
        {
            name: "additem",
            type: slashCommandTypes.subCommand,
            description: "Adds an item to the shop (Requires the \"Manage Server\" permission)",
            options: [
                {
                    type: slashCommandTypes.string,
                    name: "item-name",
                    description: "The name of the item you want to add",
                    required: true
                },
                {
                    type: slashCommandTypes.integer,
                    name: "item-price",
                    description: "The price of the item",
                    required: true,
                    minValue: 1
                },
                {
                    type: slashCommandTypes.integer,
                    name: "item-stock",
                    description: "How many of these items are in stock?",
                    required: true,
                    minValue: 1
                },
                {
                    type: slashCommandTypes.string,
                    name: "item-desc",
                    description: "The description of the item",
                    required: true
                }
            ]
        },
        {
            name: "removeitem",
            type: slashCommandTypes.subCommand,
            description: "Remove an item from the shop by its name",
            options: [
                {
                    type: slashCommandTypes.string,
                    name: "item-name",
                    description: "The name of the item to remove (Must be exact)",
                    required: true
                }
            ]
        },
        {
            name: "info",
            type: slashCommandTypes.subCommand,
            description: "Gets info an an item within the shop",
            options: [
                {
                    type: slashCommandTypes.string,
                    name: "item-name",
                    description: "The name of the item to get info on (Must be exact)",
                    required: true
                }
            ]
        },
        {
            name: "list",
            type: slashCommandTypes.subCommand,
            description: "List out all of the items within the shop!"
        }
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async ({ client, intr, dbGuild }) => {

        switch (intr.options.getSubcommand()) {
            case "additem": {
                return addItem(client, intr);
            }

            case "removeitem": {
                return removeItem(client, intr);
            }

            case "info": {
                return itemInfo(client, intr);
            }

            case "list": {
                return shopList(client, intr, dbGuild);
            }
        }
    }
};
