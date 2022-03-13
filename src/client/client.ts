/* eslint-disable @typescript-eslint/member-ordering */
import "reflect-metadata";
import { AnyChannel, Client, Collection, ColorResolvable, CommandInteraction, EmojiResolvable, Guild, GuildEmoji, GuildMember, Message, PermissionString, Role } from "discord.js";
import { Buttons, Command, Cooldowns, EmbedReplyEmbedArguments, Event, ReplyEmbedArguments, SelectMenus, SlashCommands } from "../interfaces";
import { arrayPage, capitalize, commandFailed, embedReply, formatPermsArray, formatString, getChannel, getEmote, getGuild, getMember, getRole, init, intrFollowUp, reply, sepThousands, wait } from "./index";
import { DBGuild } from "../entity/guild";


class ExtendedClient extends Client {

    // Handlers
    public commands: Collection<string, Command> = new Collection();
    public events: Collection<string, Event> = new Collection();
    public aliases: Collection<string, Command> = new Collection();
    public buttons: Collection<string, Buttons> = new Collection();
    public slashCommands: Collection<string, SlashCommands> = new Collection();
    public cooldowns: Collection<string, Cooldowns> = new Collection();
    public selectMenus: Collection<string, SelectMenus> = new Collection();
    public commandsRegistered: Promise<boolean> | undefined;

    // Saved Cache
    public uptimeTimestamp: number = Date.now();
    public guildCache: Collection<string, DBGuild> = new Collection();
    public primaryColour: ColorResolvable = "#000000";
    public currencyEmoji: EmojiResolvable = "<:chickennuggies:810599204300521512>";

    // Smaller Methods

    /**
     * Trip down a string to any length
     * @param str The string to shorten
     * @param max The max amount of characters in the string
     * @returns a shortened string with a ... at the end
    */
    public trimString = (str: string, max: number): string => str.length > max ? `${str.slice(0, max - 3)}...` : str;


    /**
     * Initialisation of the bot
    */
    public async init(): Promise<void> {
        await init(this);
    }

    /**
     * Reply to a message or interaction with a failled response
     * @param msg The message or interaction component
    */
    public async commandFailed(msg: Message | CommandInteraction, customError?: string): Promise<void | Message> {
        return commandFailed(msg, customError);
    }

    /**
     * Reply to a message or interaction
     * @param msg The message or interaction component
     * @returns A promise of a message
    */
    public async reply(msg: Message | CommandInteraction, { content, ephemeral, embeds, components, files, options, mention }: ReplyEmbedArguments): Promise<Message> {
        return reply(msg, { content, ephemeral, embeds, components, files, options, mention });
    }

    /**
     * Reply to a message or interaction as an embed
     * @param msg The message or interaction component
     * @param embed an embed object or class
     * @returns A promise of a message
    */
    public async embedReply(msg: Message | CommandInteraction, { content, ephemeral, embed, components, files, options, mention }: EmbedReplyEmbedArguments): Promise<Message> {
        return embedReply(msg, { content, ephemeral, embed, components, files, options, mention }, this);
    }

    /**
     * Follow Up to an interaction
     * @param intr The interaction component
     * @param embed an embed object or class
     * @returns A promise of a message
    */
    public async intrFollowUp(intr: CommandInteraction, { content, ephemeral, embed, components, files, options, mention }: EmbedReplyEmbedArguments): Promise<Message> {
        return intrFollowUp(intr, { content, ephemeral, embed, components, files, options, mention }, this);
    }

    /**
     * Used to create pages from an array
     * @param array The array to page
     * @param pageSize How big are each of the pages?
     * @param pageNumber Which Page number do you wish to be on?
     * @returns A page of an array
    */
    public arrayPage<T>(array: T[], pageSize: number, pageNumber: number): T[] {
        return arrayPage(array, pageSize, pageNumber);
    }

    /**
     * Force the code to wait as if it was inside of a setTimeout function
     * @param ms numbers in miliseconds to wait for
    */
    public async wait(ms: number): Promise<void> {
        return wait(ms);
    }

    /**
     * Seperate numbers over 1000 into formmated strings (Eg: 100000 = 100,000)
     * @param string The string | number to format
     * @returns A formated string
    */
    public sepThousands(string: string | number): string {
        return sepThousands(string);
    }

    /**
     * Replace words within a string
     * @param string The string that you will be replacing words in
     * @param find The search pattern that will be replaced
     * @param replace the string that will replace what is found
     * @returns A formated string
    */
    public formatString(string: string, find: string, replace: string): string {
        return formatString(string, find, replace);
    }

    /**
     * Capitalize the first letter of a string
     * @param s The string that will be effected
     * @returns A string with the first character as an upper case character
    */
    public capitalize(s: string): string {
        return capitalize(s);
    }

    /**
     * Format an array of permissions into a readable array
     * @param permsArray The permissions array that will be read
     * @returns A string which will look like "Manage guild, Manage roles, Send messages"
    */
    public formatPermsArray(permArray: PermissionString[] | undefined): string {
        return formatPermsArray(permArray);
    }

    /**
     * Used to fetch a GuildChannel
     * @param cid The Channel's ID
     * @param guildOrClient the Guild's Instance Or if you want to search the whole bot use the client
     * @returns A Channel object (All channel types except Threads)
     */
    public async getChannel(cid: string | null, guildOrClient: Guild | null | ExtendedClient): Promise<AnyChannel | null> {
        return getChannel(cid, guildOrClient);
    }

    /**
     * Used to fetch a Member
     * @param uid The Member's ID
     * @param guild the Guild's Instance
     * @returns A Member object
     */
    public async getMember(uid: string | null, guild: Guild | null): Promise<GuildMember | null> {
        return getMember(uid, guild);
    }

    /**
     * Used to fetch a Role
     * @param rid The Role's ID
     * @param guild the Guild's Instance
     * @returns A Role object
     */
    public async getRole(rid: string | null, guild: Guild | null): Promise<Role | null> {
        return getRole(rid, guild);
    }

    /**
     * Used to fetch a Guild
     * @param guildID The Guild's ID
     * @param client the Client Instance
     * @returns A Guild instance
     */
    public async getGuild(guildID: string | null): Promise<Guild | null> {
        return getGuild(guildID, this);
    }

    /**
     * Used to fetch a Guild
     * @param emote The emote to look for
     * @returns GuildEmoji
     */
    public getEmote(emote: string | null): GuildEmoji | null {
        return getEmote(emote, this);
    }


}

export default ExtendedClient;


