/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Client, Emoji, Guild, GuildMember, Message, MessageEmbed, Role, User } from "discord.js";
import { CommandoMessage } from "discord.js-commando";
import { ItemMeta } from "../entity/item";
import { ModLogs } from "../entity/modlogs";
import { Song } from "../types/musicTypes";
import axios from "axios";
import { User as entityUser } from "../entity/user";
import { musicQueue } from "./globals";
import ytdl from "ytdl-core";

/**
 * Used to check role mentions/ID's if they are roles
 * @param {Guild} guild the Guild instance the of where the Role is from
 * @param {string} rid The role mention/ID (Optional)
 * @returns {Role} A Role instance or undefined
 */
export function getRole(rid: string, guild: Guild): Role | undefined {
    let ridParsed = rid;
    // Check if a role was tagged or not. If the role was tagged remove the
    // Tag from rid.
    if (rid.startsWith("<@&") && rid.endsWith(">")) {
        const re = new RegExp("[<@&>]", "g");
        ridParsed = rid.replace(re, "");
    }
    // Try recovering the role and report if it was successful or not.
    try {
        return guild.roles.cache.get(ridParsed);
    } catch (e) {
        console.log(`Role not found because ${e}`);
        return undefined;
    }
}


/**
 * Used to check member mentions/ID's if they are roles
 * @param {string} uid The Member's ID
 * @param {Guild} guild the Guild instance the of where the Member is from
 * @returns {GuildMember} A Member instance from a server
 */
export async function getMember(uid: string, guild: Guild): Promise<GuildMember | null> {
    let uidParsed = uid;
    // Check if a member was tagged or not. If the member was tagged remove the
    // Tag from uid.
    if (uid.startsWith("<@") && uid.endsWith(">")) {
        const re = new RegExp("[<@!>]", "g");
        uidParsed = uid.replace(re, "");
    }

    if (uidParsed.length !== 18) {
        return null;
    }
    // Try recovering the role and report if it was successful or not.
    try {
        return await guild.members.fetch(uidParsed);
    } catch (e) {
        console.log(`Member not found because ${e}`);
        return null;
    }
}


/**
 * Used to check member mentions/ID's if they are roles
 * @param {string} uid The User's ID
 * @param {Guild} client  The Message Instance
 * @returns {GuildMember} A Member instance from a server
 */
export async function getUser(uid: string, client: Client): Promise<User | undefined> {
    let uidParsed = uid;
    // Check if a member was tagged or not. If the member was tagged remove the
    // Tag from uid.
    if (uid.startsWith("<@") && uid.endsWith(">")) {
        const re = new RegExp("[<@!>]", "g");
        uidParsed = uid.replace(re, "");
    }
    // Try recovering the role and report if it was successful or not.
    try {
        return await client.users.fetch(uidParsed);
    } catch (e) {
        console.log(`User not found because ${e}`);
        return undefined;
    }
}

/**
 * Used to check if a user has at least one role from a list, returns true if found
 * @param {string} emoteString The raw emote string
 * @param {Client} client The client that is initialised
 * @returns {Emoji | undefined} Either returns the emote or undefiend
 */
export function getEmote(emoteString: string, client: Client): Emoji | undefined {
    if (!emoteString.match(/\:(.*?)\>/g)) {
        return undefined;
    }

    const findEmote = emoteString.slice(3).match(/\:.*?\>/g);
    if (findEmote === null) {
        return undefined;
    }

    const theMatch = findEmote[0].slice(1, -1);

    const emote = client.emojis.cache.get(theMatch);

    if (emote) {
        return emote;
    }

    return undefined;
}


/**
 * Used to create pages from a user entity
 * @param {Array} array The array to page
 * @param {number} pageSize How big are each of the pages?
 * @param {number} pageNumber Which Page number do you wish to be on?
 * @returns {Array} an array
 */
export function userpaginate(array: entityUser[], pageSize: number, pageNumber: number): entityUser[] {
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
}

/**
 * Used to create pages from any array
 * @param {Array} array The array to page
 * @param {number} pageSize How big are each of the pages?
 * @param {number} pageNumber Which Page number do you wish to be on?
 * @returns {Array} an array
 */
export function queuePaginate(array: Song[], pageSize: number, pageNumber: number): Song[] {
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
}


/**
 * Used to create pages from a shop entity
 * @param {Array} array The array to page
 * @param {number} pageSize How big are each of the pages?
 * @param {number} pageNumber Which Page number do you wish to be on?
 * @returns {Array} an array
 */
export function shoppaginate(array: ItemMeta[], pageSize: number, pageNumber: number): ItemMeta[] {
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
}


/**
 * Used to create pages from a userLogs entity
 * @param {Array} array The array to page
 * @param {number} pageSize How big are each of the pages?
 * @param {number} pageNumber Which Page number do you wish to be on?
 * @returns {Array} an array
 */
export function userlogspaginate(array: ModLogs[], pageSize: number, pageNumber: number): ModLogs[] {
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
}


/**
 * Used to create pages from a string array
 * @param {Array} array The array to page
 * @param {number} pageSize How big are each of the pages?
 * @param {number} pageNumber Which Page number do you wish to be on?
 * @returns {Array} an array
 */
export function stringpaginate(array: string[], pageSize: number, pageNumber: number): string[] {
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
}


/**
 * Wait in miliseconds
 * @param {number} milliseconds The time in mlliseconds to wait
 */
export function sleep(milliseconds: number): void {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}


/**
 * Get random number between 2 integers
 * @param {number} max The highest possible number
 * @param {number} min The lowest possible number
 * @returns {number} a random number between max and min
 */
export function ranNum(max: number, min: number): number {
    return Math.floor(Math.random() * max + min);
}


/**
 * Get random item from an array
 * @param {Array} array The array to get random item from
 * @returns {unknown} A random item from an array
 */
export function ranArray(array: unknown[]): unknown {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get a random anime quote in form of an embed
 * @returns {MessageEmbed} a embed with the quote from animechan
 */
export async function getAnimeQuote(): Promise<MessageEmbed> {
    try {
        const quote = await axios.get("https://animechan.vercel.app/api/random");

        const embed = new MessageEmbed()
            .setTitle(`Anime - ${quote.data.anime}`)
            .setDescription(`"${quote.data.quote}"`)
            .setFooter(`- ${ quote.data.character }`);
        return embed;

    } catch (e) {

        const embed = new MessageEmbed()
            .setTitle("Whoops")
            .setDescription("Sorry we hit our rate limit on the api")
            .setFooter("- Devs");
        return embed;

    }
}

export async function playSong(msg: CommandoMessage | Message, song: string | undefined): Promise<CommandoMessage | Message | void> {
    if (msg.guild === null) {
        return msg.channel.send("This is an guild only command");
    }

    const queue = musicQueue.get(msg.guild.id);

    if (!queue) {
        return msg.channel.send("Error. queue was not found");
    }

    // If theres no songs in the queue wait 30 seconds,
    // And if no new songs where added to the queue leave the vc
    if (!song) {
        setTimeout(() => {
            if (msg.guild === null) {
                return msg.channel.send("This is an guild only command");
            }
            if (queue.connection?.dispatcher && msg.guild.me?.voice.channel)
                return;
            queue.connection?.channel.leave();
            void queue.msg.channel.send("There was nothing left to play. so i left the channel").then((delMsg) => {
                void delMsg.delete( { timeout: 10000 });
            });
        }, 30000);
        await queue.msg.delete();
        queue.msg.channel.send("There were no more songs added onto the queue so I left the vc").catch(console.error);
        return void musicQueue.delete(msg.guild.id);
    }
    // Get the song
    const stream = ytdl(song);

    // If we get disconnected delete the queue
    queue.connection?.on("disconnect", () => {
        if (queue.msg.guild === null) {
            return msg.channel.send("This is an guild only command");
        }
        musicQueue.delete(queue.msg.guild.id);
    });

    // If we aren connected to the vc, warn the user and delete the queue
    if (!queue.connection) {
        musicQueue.delete(msg.guild.id);
        return queue.msg.channel.send("An error happened while trying to join your vc. Please try again");
    }
    // If the msg parsed is our own message delete it and send a new and updated one
    if (msg.client.user && msg.author.id === msg.client.user.id) {
        await queue.msg.delete();
    }
    if (msg.guild === null)
        return;
    if (msg.guild.me === null)
        return;

    const embed = new MessageEmbed()
        .setThumbnail(queue.songs[queue.at].authorAvatar)
        .setTitle(`Now Playing - ${queue.songs[queue.at].authorName}`)
        .setDescription(`**[${queue.songs[queue.at].title}](${queue.songs[queue.at].url})**`)
        .setColor(msg.guild?.me.displayColor)
        .setImage(queue.songs[queue.at].thumbnail);

    let message = await queue.msg.channel.send(embed);

    queue.msg = message;
    queue.playing = true;
    musicQueue.set(msg.guild.id, queue);
    // Play the song
    const dispatch = queue.connection.play(stream);
    // When song is finished playing. then check if theres any songs left on the queue and if there isnt and looping is on restart the playlist
    dispatch.on("finish", () => {
        if (msg.guild === null) {
            return queue.msg.channel.send("This is an guild only command");
        }

        if (queue.looping && queue.at >= queue.totalSongs - 1) {
            queue.at = 0;
            return void playSong(queue.msg, queue.songs[0].url);
        } else if (queue.at <= queue.totalSongs - 1) {
            queue.at += 1;
            musicQueue.set(msg.guild.id, queue);
            console.log(queue.songs[queue.at]?.url);
            return void playSong(queue.msg, queue.songs[queue.at]?.url);
        }
        console.log("nothing matched");
        console.log(queue);
        return void playSong(queue.msg, undefined);

    });
    // If an error occures while playing tell the user and log it
    dispatch.on("error", async (err) => {

        message = await queue.msg.channel.send("Whoops some error happended please report this to the dev team");
        console.log(err);
        queue.connection?.disconnect();
    });
    // Sets the volume to 0.1 decibels. PLEASE DO NOT CHANGE CAN CAUSE BAD AUDIO QUALITY
    dispatch.setVolume(0.1);
}
