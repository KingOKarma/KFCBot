import { createConnection, getRepository } from "typeorm";
import fs, { readdirSync } from "fs";
import { Bot } from "../../entity/bot";
import { CONFIG } from "../../globals";
import ExtendedClient from "../client";
import { guildRefresh } from "../../cache/guild";
import path from "path";


export async function init(client: ExtendedClient): Promise<void> {
    await createConnection();
    await client.login(CONFIG.token).catch(console.error);

    const botRepo = getRepository(Bot);

    await guildRefresh(client);

    let uptime = await botRepo.findOne({ where: { type: "uptimeTimeStamp" } });

    if (!uptime) {
        const newTimestamp = new Bot();
        newTimestamp.type = "uptimeTimeStamp";
        newTimestamp.value = client.uptimeTimestamp.toString();
        await botRepo.save(newTimestamp);
        uptime = newTimestamp;
    }

    uptime.value = client.uptimeTimestamp.toString();
    await botRepo.save(uptime);

    /* Commands */
    const commandPath = path.join(__dirname, "..", "..", "commands");
    fs.readdirSync(commandPath).forEach(async (dir) => {
        const cmds = readdirSync(`${commandPath}/${dir}`).filter((file) => file.endsWith(".js"));

        for (const file of cmds) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { command } = await import(`${commandPath}/${dir}/${file}`);
            client.commands.set(command.name, command);

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
                    client.aliases.set(alias, command);
                });
            }

        }
    });

    /* Events */
    const eventPath = path.join(__dirname, "..", "..", "events");
    fs.readdirSync(eventPath).filter((file) => file.endsWith(".js")).forEach(async (file) => {
        const { event } = await import(`${eventPath}/${file}`);
        client.events.set(event.name, event);
        console.log(event);
        client.on(event.name, event.run.bind(null, client));
    });


    /* Buttons */
    const buttonsPath = path.join(__dirname, "..", "..", "interactions", "buttons");
    fs.readdirSync(buttonsPath).forEach((dir) => {
        const buttonFiles = readdirSync(`${buttonsPath}/${dir}`).filter((file) => file.endsWith(".js"));

        for (const file of buttonFiles) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { buttons } = require(`${buttonsPath}/${dir}/${file}`);
            client.buttons.set(buttons.name, buttons);

        }
    });

    /* Select Menus */
    const menuPath = path.join(__dirname, "..", "..", "interactions", "selectMenus");
    fs.readdirSync(menuPath).forEach((dir) => {
        const menuFiles = readdirSync(`${menuPath}/${dir}`).filter((file) => file.endsWith(".js"));

        for (const file of menuFiles) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { menu } = require(`${menuPath}/${dir}/${file}`);
            client.selectMenus.set(menu.name, menu);

        }
    });

    /* Slash Commands */
    const slashPath = path.join(__dirname, "..", "..", "interactions", "slashCommands");
    fs.readdirSync(slashPath).forEach(async (dir) => {
        const slashCommmands = readdirSync(`${slashPath}/${dir}`).filter((file) => file.endsWith(".js"));

        for (const file of slashCommmands) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { slashCommand } = require(`${slashPath}/${dir}/${file}`);
            client.slashCommands.set(slashCommand.name, slashCommand);

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