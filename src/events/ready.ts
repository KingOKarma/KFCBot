import { ApplicationCommandDataResolvable } from "discord.js";
import { CONFIG } from "../globals";
import { Event } from "../interfaces/index";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import chalk from "chalk";


export const event: Event = {
    name: "ready",
    run: async (client) => {

        console.log(`${chalk.green("[INFO]")} ${client.user?.tag} is online!\n`);

        if (!client.application?.owner) await client.application?.fetch();

        if (client.application === null) {
            throw new Error("Client Did not register in time, please try again");
        }

        // await client.wait(5000);

        const commands = client.slashCommands.map((data) => {
            const value: ApplicationCommandDataResolvable = {
                name: data.name,
                description: data.description,
                defaultPermission: data.defaultPermission,
                options: data.options
            };

            return value;
        });

        console.log(`${chalk.cyan("[LIST]")} ${commands.map((c) => c.name)}\n`);

        try {
            if (CONFIG.devEnv.isDev) {
                CONFIG.devEnv.devServer.forEach(async (s) => {
                    const guild = await client.getGuild(s);

                    if (guild === null) {
                        return void console.log(`${chalk.red("[ERROR]")} Could not find Dev ServerID`);
                    }

                    await guild.commands.set(commands);
                    // await client.application?.commands.set([]);


                });
                console.log(`${chalk.green("[INFO]")} Set Commands for Dev Server\nCommands List:`
                    + `\n ${commands.map((c) => c.name).join(", ")}\n`);

            } else {

                await client.application.commands.set(commands);
                console.log(`${chalk.green("[INFO]")} Set Commands for Production\nCommands List:`
                    + `\n ${(await client.application.commands.fetch()).map((c) => c.name).join(", ")}\n`);
            }

        } catch (error) {
            console.log(`${chalk.red("[ERROR]")} There was an error registering a slash command \n${error}`);
        }

        const rest = new REST({ version: "9" }).setToken(CONFIG.token);
        const clientID: string = client.application.id;

        await (async (): Promise<void> => {
            try {

                console.log(`${chalk.blue("[PROCESS]")} Started refreshing application (/) commands`);


                if (CONFIG.devEnv.isDev) {
                    CONFIG.devEnv.devServer.forEach(async (s) => {
                        const apiPath = Routes.applicationGuildCommands(clientID, s);
                        await rest.put(
                            apiPath,
                            { body: commands }
                        );

                    });
                    console.log(`${chalk.blue("[PROCESS]")} Refreshing Commands in Development`);

                } else {

                    await rest.put(
                        Routes.applicationCommands(clientID),
                        { body: commands }
                    );
                    console.log(`${chalk.blue("[PROCESS]")} Refreshing Commands in Production,`
                        + "This can take a while (Possibly up to an hour or longer)");

                }

                console.log(`${chalk.green("[INFO]")} Sucessfully reloaded application (/) commands.\n`);
            } catch (error) {
                console.error(error);
            }
        })();

    }
};
