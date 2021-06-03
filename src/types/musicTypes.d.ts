
import { Message, VoiceConnection } from "discord.js";
import { CommandoMessage } from "discord.js-commando";

/**
 * @type {Queue}
 * @property {number} at The song the bot is currently at
 * @property {number} length The length of the whole queue in ms
 * @property {string[]} songs all the songs currently in queue
 * @property {number} totalSongs The total number of songs in the queue
 */

export interface Queue {
    at: number;
    connection: VoiceConnection | null;
    length: number;
    looping: boolean;
    msg: CommandoMessage | Message;
    playing: boolean;
    songs: Song[];
    totalSongs: number;
}

export interface Song {
    id: string;
    lengthSeconds: string;
    title: string;
    url: string;
}