import { Message, PermissionString } from "discord.js";
import { CONFIG } from "../../globals";
import ExtendedClient from "../../client/client";
import ms from "ms";


export async function commandHandler(client: ExtendedClient, msg: Message): Promise<void | Message> {
    if (msg.author.bot || !msg.guild || !msg.content.startsWith(CONFIG.prefix)) return;

    const args = msg.content
        .slice(CONFIG.prefix.length)
        .trim()
        .split(/ +/g);

    const cmd = args.shift()?.toLowerCase();

    if (cmd === undefined) return;
    const command = client.commands.get(cmd) ?? client.aliases.get(cmd);
    if (command) {

        let shouldrun = true;
        let reason = "error";

        if (command.devonly === true) {
            if (CONFIG.owners.some((d) => d === msg.author.id)) {
                shouldrun = false;
                reason = "You must be a deveoper to run this command!";
            }
        }

        const userPerms = client.formatPermsArray(command.permissionsUser as PermissionString[]);

        if (!(msg.member?.permissions.has(command.permissionsUser ?? []) ?? false)) {
            return msg.reply({ content: `You require! the permission(s)\n> ${userPerms}\nTo use this command` });

        }

        const clientPerms = client.formatPermsArray(command.permissionsBot as PermissionString[]);

        if (!(msg.guild.me?.permissions.has(command.permissionsBot ?? []) ?? false)) {
            return msg.reply({ content: `I require! the permission(s)\n> ${clientPerms}\nTo use this command` });

        }

        if (command.cooldown !== undefined) {
            const cooldown = client.cooldowns.get(`${command.name}/${msg.author.id}`);
            if (cooldown) {
                const timePassed = Date.now() - cooldown.timeSet;
                const timeLeft = command.cooldown * 1000 - timePassed;

                let response = `${command.cooldownResponse ?? `Hey you're going too fast, please wait another ${ms(timeLeft)}`}`;

                if (response.includes("{time}")) {
                    const replace = new RegExp("{time}", "g");
                    response = response.replace(replace, ms(timeLeft));
                }

                return msg.reply(response);
            }
            client.cooldowns.set(`${command.name}/${msg.author.id}`, {
                command: command.name,
                cooldownTime: command.cooldown,
                timeSet: Date.now(),
                userID: msg.author.id
            });

            setTimeout(() => {
                client.cooldowns.delete(`${command.name}/${msg.author.id}`);
            }, command.cooldown * 1000);
        }

        if (!shouldrun) return msg.reply(reason);

        command.run(client, msg, args);

    } else {

        const slashCommand = client.slashCommands.get(cmd);

        if (slashCommand) {
            client.commands.get("help")?.run(client, msg, []);
        }

    }
}