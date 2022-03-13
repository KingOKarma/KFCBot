import { createConnection, getRepository } from "typeorm";
import { Bot } from "../../entity/bot";
import { CONFIG } from "../../globals";
import ExtendedClient from "../client";
import { guildRefresh } from "../../cache/guild";
import path from "path";
import { readdirSync } from "fs";


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

    await new Promise<void>((resolve, reject) => {

        try {

            /* Commands */
            const commandPath = path.join(__dirname, "..", "..", "commands");
            readdirSync(commandPath).forEach(async (dir) => {
                const cmds = readdirSync(`${commandPath}/${dir}`).filter((file) => file.endsWith(".js"));
                for (const file of cmds) {
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
        } catch (err) {
            console.log(`Commnad setup error, reason:\n${err}`);
            reject(err);
        }
        resolve();
    });


    /* Events */
    const eventPath = path.join(__dirname, "..", "..", "events");
    readdirSync(eventPath).filter((file) => file.endsWith(".js")).forEach(async (file) => {
        const { event } = await import(`${eventPath}/${file}`);
        client.events.set(event.name, event);
        console.log(event);
        client.on(event.name, event.run.bind(null, client));
    });


    /* Buttons */
    const buttonsPath = path.join(__dirname, "..", "..", "interactions", "buttons");
    readdirSync(buttonsPath).forEach(async (dir) => {
        const buttonFiles = readdirSync(`${buttonsPath}/${dir}`).filter((file) => file.endsWith(".js"));

        for (const file of buttonFiles) {
            const { buttons } = await import(`${buttonsPath}/${dir}/${file}`);
            client.buttons.set(buttons.name, buttons);

        }
    });

    /* Select Menus */
    const menuPath = path.join(__dirname, "..", "..", "interactions", "selectMenus");
    readdirSync(menuPath).forEach(async (dir) => {
        const menuFiles = readdirSync(`${menuPath}/${dir}`).filter((file) => file.endsWith(".js"));

        for (const file of menuFiles) {
            const { menu } = await import(`${menuPath}/${dir}/${file}`);
            client.selectMenus.set(menu.name, menu);

        }
    });


    try {
        /* Slash Commands */
        const slashPath = path.join(__dirname, "..", "..", "interactions", "slashCommands");
        readdirSync(slashPath).forEach(async (dir) => {
            const slashCommmands = readdirSync(`${slashPath}/${dir}`).filter((file) => file.endsWith(".js"));

            await new Promise<void>((resolve) => {
                slashCommmands.forEach(async (file, index, array) => {
                    const { slashCommand } = await import(`${slashPath}/${dir}/${file}`);
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
                    if (index === array.length - 1) resolve();
                });

            });
        });
    } catch (err) {
        console.log(`Slash Commnad setup error, reason:\n${err}`);
    }


}