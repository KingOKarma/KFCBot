/* eslint-disable @typescript-eslint/member-ordering */
import "reflect-metadata";
import { Client, Collection, CommandInteraction, Message } from "discord.js";
import { Command, Event } from "../interfaces/index";
import { createConnection, getRepository } from "typeorm";
import fs, { readdirSync } from "fs";
import { Bot } from "../entity/bot";
import Buttons from "../interfaces/buttons";
import { CONFIG } from "../globals";
import { Cooldowns } from "../interfaces/cooldown";
import SelectMenus from "../interfaces/selectMenus";
import { SlashCommands } from "../interfaces/slashCommands";
import path from "path";

class ExtendedClient extends Client {
    public commands: Collection<string, Command> = new Collection();
    public events: Collection<string, Event> = new Collection();
    public aliases: Collection<string, Command> = new Collection();
    public buttons: Collection<string, Buttons> = new Collection();
    public slashCommands: Collection<string, SlashCommands> = new Collection();
    public cooldowns: Collection<string, Cooldowns> = new Collection();
    public selectMenus: Collection<string, SelectMenus> = new Collection();
    public uptimeTimestamp: number = Date.now();
    public async init(): Promise<void> {
        await createConnection();
        await this.login(CONFIG.token).catch(console.error);

        const botRepo = getRepository(Bot);

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

}

export default ExtendedClient;


