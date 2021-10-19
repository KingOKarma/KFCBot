/* eslint-disable sort-keys */
/* eslint-disable @typescript-eslint/member-ordering */
import { Collection, MessageButton } from "discord.js";
import Config from "./config";

export const CONFIG = Config.getConfig();

export const commands = new Collection;

export const deleteButton = new MessageButton()
    .setCustomId("delete")
    .setLabel("❌")
    .setStyle("DANGER");


interface SlashCommandTypes {
    subCommand: number;
    subCommandGroup: number;
    string: number;
    integer: number;
    boolean: number;
    user: number;
    channel: number;
    role: number;
    mentionable: number;
    number: number;


}

export const slashCommandTypes: SlashCommandTypes = {
    subCommand: 1,
    subCommandGroup: 2,
    string: 3,
    integer: 4,
    boolean: 5,
    user: 6,
    channel: 7,
    role: 8,
    mentionable: 9,
    number: 10
};


export const globalEmotes = {
    chickenNuggie: "<:chickennuggies:810599204300521512>",
    statuses: {
        dnd: "<:DnD:813085519075606548>",
        idle: "<:Idle:813085529917751301>",
        invisible: "<:Invisible:813085537702772796>",
        offline: "<:Offline:813085510947045427>",
        online: "<:Online:813085501997318184>"
    },

    verifiedEmote: "<:verified:850823958952542209>",
    loading: "<a:loading:890514467018903562>"
};