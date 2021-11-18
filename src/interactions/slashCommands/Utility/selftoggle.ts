import { SlashCommands } from "../../../interfaces/slashCommands";
import { User } from "../../../entity/user";
import { getRepository } from "typeorm";
import { slashCommandTypes } from "../../../globals";

export const slashCommand: SlashCommands = {
    description: "Allows you to toggle certain modules that interact with your user specifically",
    group: "Utility",
    guildOnly: true,
    name: "self-toggle",
    options: [
        {
            choices: [
                {
                    name: "level",
                    value: "level"
                }
            ],
            description: "Which module are you toggling",
            name: "module",
            required: true,
            type: slashCommandTypes.string
        },
        {
            description: "Enable or Disable a module, Leave blank to check status",
            name: "enabled",
            type: slashCommandTypes.boolean
        }
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async(client, intr) => {

        const toggleModule = intr.options.getString("module") ?? "none";

        const toggle = intr.options.getBoolean("enabled");

        const userRepo = getRepository(User);

        let dbUser = await userRepo.findOne( { where: { serverId: intr.guild?.id ?? "00", uid: intr.user.id } });

        if (!dbUser) {
            const newUser = new User();
            newUser.uid = intr.user.id;
            newUser.serverId = intr.guild?.id ?? "Null Name";
            await userRepo.save(newUser);
            dbUser = newUser;
        }

        switch (toggleModule) {

            case "level": {
                switch (toggle) {

                    case true: {
                        dbUser.levelEnabled = true;
                        await userRepo.save(dbUser);
                        return client.reply(intr, { content: "You will now collect XP, and the Level based commands have been enabled", ephemeral: true });
                    }

                    case false: {
                        dbUser.levelEnabled = false;
                        await userRepo.save(dbUser);
                        return client.reply(intr, { content: "You will no longer collect XP, and the Level based commands have been disabled", ephemeral: true });
                    }

                    default: {

                        return client.reply(intr, { content: `The Levels module is currently ${dbUser.levelEnabled ? "Enabled" : "Disabled"}`, ephemeral: true });
                    }
                }
            }
            default: {
                return client.commandFailed(intr, "A module that doesn't exist was selected");

            }
        }


    }
};