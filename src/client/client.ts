/* eslint-disable @typescript-eslint/member-ordering */
import "reflect-metadata";
import { Client, Collection, ColorResolvable, CommandInteraction, EmojiResolvable, Message, MessageEmbed } from "discord.js";
import { Command, Event } from "../interfaces/index";
import { createConnection, getRepository } from "typeorm";
import fs, { readdirSync } from "fs";
import { Bot } from "../entity/bot";
import Buttons from "../interfaces/buttons";
import { CONFIG } from "../globals";
import { Cooldowns } from "../interfaces/cooldown";
import { DBGuild } from "../entity/guild";
import { EmbedReplyEmbedArguments } from "../interfaces/functionInterfaces/embedReplyCommand";
import { ReplyEmbedArguments } from "../interfaces/functionInterfaces/replyCommand";
import SelectMenus from "../interfaces/selectMenus";
import { SlashCommands } from "../interfaces/slashCommands";
import { guildRefresh } from "../cache/guild";
import path from "path";

class ExtendedClient extends Client {

    // Handlers
    public commands: Collection<string, Command> = new Collection();
    public events: Collection<string, Event> = new Collection();
    public aliases: Collection<string, Command> = new Collection();
    public buttons: Collection<string, Buttons> = new Collection();
    public slashCommands: Collection<string, SlashCommands> = new Collection();
    public cooldowns: Collection<string, Cooldowns> = new Collection();
    public selectMenus: Collection<string, SelectMenus> = new Collection();

    // Saved Cache
    public uptimeTimestamp: number = Date.now();
    public guildCache: Collection<string, DBGuild> = new Collection();
    public primaryColour: ColorResolvable = "#000000";
    public currencyEmoji: EmojiResolvable = "<:chickennuggies:810599204300521512>";


    // Functions
    public async init(): Promise<void> {
        await createConnection();
        await this.login(CONFIG.token).catch(console.error);

        const botRepo = getRepository(Bot);

        await guildRefresh(this);

        let uptime = await botRepo.findOne({ where: { type: "uptimeTimeStamp" } });

        if (!uptime) {
            const newTimestamp = new Bot();
            newTimestamp.type = "uptimeTimeStamp";
            newTimestamp.value = this.uptimeTimestamp.toString();
            await botRepo.save(newTimestamp);
            uptime = newTimestamp;
        }

        uptime.value = this.uptimeTimestamp.toString();
        await botRepo.save(uptime);

        /* Commands */
        const commandPath = path.join(__dirname, "..", "commands");
        fs.readdirSync(commandPath).forEach(async (dir) => {
            const cmds = readdirSync(`${commandPath}/${dir}`).filter((file) => file.endsWith(".js"));

            for (const file of cmds) {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { command } = await import(`${commandPath}/${dir}/${file}`);
                this.commands.set(command.name, command);

                let commands = await botRepo.findOne({ where: { name: command.name, type: "command" } });

                if (!commands) {
                    const newCommand = new Bot();
                    newCommand.type = "command";
                    newCommand.name = command.name;
                    newCommand.description = command.description;
                    newCommand.group = command.group;

                    await botRepo.save(newCommand);
                    commands = newCommand;
                }

                commands.name = command.name;
                commands.description = command.description;
                commands.group = command.group;
                await botRepo.save(commands);

                if (command?.aliases !== undefined) {
                    command.aliases.forEach((alias: string) => {
                        this.aliases.set(alias, command);
                    });
                }

            }
        });

        /* Events */
        const eventPath = path.join(__dirname, "..", "events");
        fs.readdirSync(eventPath).filter((file) => file.endsWith(".js")).forEach(async (file) => {
            const { event } = await import(`${eventPath}/${file}`);
            this.events.set(event.name, event);
            console.log(event);
            this.on(event.name, event.run.bind(null, this));
        });


        /* Buttons */
        const buttonsPath = path.join(__dirname, "..", "interactions", "buttons");
        fs.readdirSync(buttonsPath).forEach((dir) => {
            const buttonFiles = readdirSync(`${buttonsPath}/${dir}`).filter((file) => file.endsWith(".js"));

            for (const file of buttonFiles) {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { buttons } = require(`${buttonsPath}/${dir}/${file}`);
                this.buttons.set(buttons.name, buttons);

            }
        });

        /* Select Menus */
        const menuPath = path.join(__dirname, "..", "interactions", "selectMenus");
        fs.readdirSync(menuPath).forEach((dir) => {
            const menuFiles = readdirSync(`${menuPath}/${dir}`).filter((file) => file.endsWith(".js"));

            for (const file of menuFiles) {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { menu } = require(`${menuPath}/${dir}/${file}`);
                this.selectMenus.set(menu.name, menu);

            }
        });

        /* Slash Commands */
        const slashPath = path.join(__dirname, "..", "interactions", "slashCommands");
        fs.readdirSync(slashPath).forEach(async (dir) => {
            const slashCommmands = readdirSync(`${slashPath}/${dir}`).filter((file) => file.endsWith(".js"));

            for (const file of slashCommmands) {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { slashCommand } = require(`${slashPath}/${dir}/${file}`);
                this.slashCommands.set(slashCommand.name, slashCommand);

                let commands = await botRepo.findOne({ where: { name: slashCommand.name, type: "slashCommand" } });

                if (!commands) {
                    const newCommand = new Bot();
                    newCommand.type = "slashCommand";
                    newCommand.name = slashCommand.name;
                    newCommand.description = slashCommand.description;
                    newCommand.group = slashCommand.group;

                    await botRepo.save(newCommand);
                    commands = newCommand;
                }

                commands.name = slashCommand.name;
                commands.description = slashCommand.description;
                commands.group = slashCommand.group;
                await botRepo.save(commands);

            }

        });


    }

    public async commandFailed(msg: Message | CommandInteraction, reason?: string): Promise<void | Message> {

        let response = "There was an error when executing the command";
        if (reason !== undefined) response = `There was an error when executing the command, Reason:\n${reason}`;

        if (msg instanceof Message) {
            return msg.reply({ content: response });

        }
        return msg.reply({ content: response, ephemeral: true });


    }

    public async reply(msg: Message | CommandInteraction, { content, ephemeral, embeds, components, files, options, mention }: ReplyEmbedArguments): Promise<void | Message> {

        if (msg instanceof Message) {
            if (ephemeral === true) console.log("Ephemeral messages can only be used with / commands");
            return msg.reply({
                allowedMentions: mention ?? false ? { repliedUser: false } : undefined,
                components,
                content: content ?? undefined,
                embeds: embeds ? Array.isArray(embeds) ? embeds : [embeds] : undefined,
                files,
                options

            });
        }

        return msg.reply({
            allowedMentions: mention ?? false ? { repliedUser: false } : undefined,
            components,
            content: content ?? undefined,
            embeds: embeds ? Array.isArray(embeds) ? embeds : [embeds] : undefined,
            ephemeral,
            files,
            options

        });

    }

    public async embedReply(msg: Message | CommandInteraction, { content, ephemeral, embed, components, files, options, mention }: EmbedReplyEmbedArguments): Promise<Message> {


        let colour = this.primaryColour;
        const cGuild = this.guildCache.get(msg.guildId ?? "");

        if (cGuild) {
            colour = cGuild.primaryColour as ColorResolvable;
        }


        if (embed instanceof MessageEmbed)
            if (embed.color === null) embed.setColor(colour);

        if (msg instanceof Message) {
            if (ephemeral === true) console.log("Ephemeral messages can only be used with / commands");

            return msg.reply({
                allowedMentions: mention ?? false ? { repliedUser: false } : undefined,
                components,
                content: content ?? undefined,
                embeds: embed instanceof MessageEmbed ? [embed] :
                    [{
                        "author": embed.author,
                        "color": embed.color ?? colour,
                        "description": embed.description,
                        "fields": embed.fields,
                        "footer": embed.footer,
                        "image": embed.image,
                        "thumbnail": embed.thumbnail,
                        "timestamp": embed.timestamp,
                        "title": embed.title,
                        "url": embed.url,
                        "video": embed.video
                    }],
                files,
                options

            });
        }

        await msg.reply({
            allowedMentions: mention ?? false ? { repliedUser: false } : undefined,
            components,
            content: content ?? undefined,
            embeds: embed instanceof MessageEmbed ? [embed] :
                [{
                    "author": embed.author,
                    "color": embed.color ?? colour,
                    "description": embed.description,
                    "fields": embed.fields,
                    "footer": embed.footer,
                    "image": embed.image,
                    "thumbnail": embed.thumbnail,
                    "timestamp": embed.timestamp,
                    "title": embed.title,
                    "url": embed.url,
                    "video": embed.video
                }], ephemeral,
            files,
            options

        });
        return await msg.fetchReply() as Message;

    }

    public async intrFollowUp(intr: CommandInteraction, { content, ephemeral, embed, components, files, options, mention }: EmbedReplyEmbedArguments): Promise<Message> {


        let colour = this.primaryColour;
        const cGuild = this.guildCache.get(intr.guildId ?? "");

        if (cGuild) {
            colour = cGuild.primaryColour as ColorResolvable;
        }

        if (embed instanceof MessageEmbed)
            if (embed.color === null) embed.setColor(colour);


        await intr.followUp({
            allowedMentions: mention ?? false ? { repliedUser: false } : undefined,
            components,
            content: content ?? undefined,
            embeds: embed instanceof MessageEmbed ? [embed] :
                [{
                    "author": embed.author,
                    "color": embed.color ?? colour,
                    "description": embed.description,
                    "fields": embed.fields,
                    "footer": embed.footer,
                    "image": embed.image,
                    "thumbnail": embed.thumbnail,
                    "timestamp": embed.timestamp,
                    "title": embed.title,
                    "url": embed.url,
                    "video": embed.video
                }], ephemeral,
            files,
            options

        });
        return await intr.fetchReply() as Message;

    }


    /**
 * Used to create pages from an array
 * @param {Array} array The array to page
 * @param {number} pageSize How big are each of the pages?
 * @param {number} pageNumber Which Page number do you wish to be on?
 * @returns {Array} an array
 */
    public arrayPage<T>(array: T[], pageSize: number, pageNumber: number): T[] {
        return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
    }

    public async wait(ms: number): Promise<void> {
        return new Promise<void>((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    /**
 * Seperate numbers over 1000 into formmated strings (Eg: 100000 = 100,000)
 * @param {string | number} string The string | number to format
 * @returns {string} A formated string
 */
    public sepThousands(string: string | number): string {
        if (typeof string === "string") {
            return string.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        return string.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    }


}

export default ExtendedClient;


