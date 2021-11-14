import { Message, MessageEmbed, PermissionString } from "discord.js";
import { CONFIG } from "../globals";
import { Event } from "../interfaces/event";
import { GlobalUser } from "../entity/globalUser";
import { User } from "../entity/user";
import { Guild as entityGuild } from "../entity/guild";
import { formatPermsArray } from "../utils/formatPermsArray";
import { getRepository } from "typeorm";
import ms from "ms";

const xpTimeout = new Map();

export const event: Event = {
    name: "messageCreate",
    run: async (client, msg: Message) => {
        if (msg.author.bot || !msg.guild) return;

        const userRepo = getRepository(User);
        const gUserRepo = getRepository(GlobalUser);
        const guildRepo = getRepository(entityGuild);

        let guild = await guildRepo.findOne( { serverid: msg.guild.id });
        const user = await userRepo.findOne({ serverId: msg.guild.id, uid: msg.author.id });
        let gUser = await gUserRepo.findOne( { uid: msg.author.id } );
        const timeout = xpTimeout.get(msg.author.id);
        let xpGain = Math.ceil(msg.content.length * 2);

        // If above 10, set 10
        if (xpGain > 11) {
            xpGain = Math.ceil(+10);
        }

        // If there is no Guild then add to  DB
        if (!guild) {
            const newGuild = new entityGuild();
            newGuild.serverid = msg.guild.id;
            newGuild.name = msg.guild.name;
            await guildRepo.save(newGuild);
            guild = newGuild;
        }

        // If server boosted then x2 and let premium user get 3x
        let multiplier = 2;
        if (guild.boosted) {
            xpGain *= multiplier;
            multiplier += 1;
        }

        // If there is no GlobalUser then add to  DB
        if (!gUser) {
            const newGUser = new GlobalUser();
            newGUser.avatar = msg.author.displayAvatarURL({ dynamic: true });
            newGUser.uid = msg.author.id;
            newGUser.tag = msg.author.tag;
            await gUserRepo.save(newGUser);
            gUser = newGUser;
        } else {
            gUser.avatar = msg.author.displayAvatarURL({ dynamic: true });
            gUser.uid = msg.author.id;
            gUser.tag = msg.author.tag;
            await gUserRepo.save(gUser);
        }

        // Check if user is a premium user, if true x2 xp
        if (gUser.premium) xpGain *= multiplier;

        // Check Timeout
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!timeout) {

            // If Member doesn't exist add to DB
            if (!user) {
                const newUser = new User();
                newUser.uid = msg.author.id;
                newUser.serverId = msg.guild.id;
                newUser.avatar = msg.author.displayAvatarURL({ dynamic: true });
                newUser.tag = msg.author.tag;
                newUser.xp = xpGain;
                await userRepo.save(newUser);

                // Level up member
            } else if (user.xp + xpGain >= Math.round((user.level + 1) * 1000)) {
                const gain = Math.round((user.level + 1) * 1000) - (user.xp + xpGain);
                user.uid = msg.author.id;
                user.serverId = msg.guild.id;
                user.avatar = msg.author.displayAvatarURL({ dynamic: true });
                user.tag = msg.author.tag;
                user.xp = gain;
                user.totalXp += xpGain;
                user.level += 1;

                await userRepo.save(user);

                const embed = new MessageEmbed()
                    .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
                    .setTitle(`Congrats you level up to ${user.level}!`)
                    .setTimestamp();
                return msg.reply( { embeds: [embed] } );

                // Default Add XP
            } else {
                user.uid = msg.author.id;
                user.serverId = msg.guild.id;
                user.avatar = msg.author.displayAvatarURL({ dynamic: true });
                user.tag = msg.author.tag;
                user.totalXp += xpGain;
                user.xp += xpGain;

                xpTimeout.set(msg.author.id, "1");
                setTimeout(() => {
                    xpTimeout.delete(msg.author.id);
                }, 5 * 2000);
                await userRepo.save(user);
            }
        }


        if (!msg.content.startsWith(CONFIG.prefix)) return;

        const args = msg.content
            .slice(CONFIG.prefix.length)
            .trim()
            .split(/ +/g);

        const cmd = args.shift()?.toLowerCase();

        if (cmd === undefined) return;
        const command = client.commands.get(cmd) ?? client.aliases.get(cmd);
        if (command) {
            // Heres an example if you want a group called "managment" only be usable by admins:

            let shouldrun = true;
            let reason = "error";

            if (command.group === "managment") {
                if (msg.member?.permissions.has("ADMINISTRATOR") === false) {
                    shouldrun = false;
                    reason = "You must be an admin to run this command!";
                }
            }

            if (command.devonly === true) {
                if (CONFIG.owners.some((d) => d === msg.author.id)) {
                    shouldrun = false;
                    reason = "You must be a deveoper to run this command!";
                }
            }

            const userPerms = formatPermsArray(command.permissionsUser as PermissionString[]);

            if (!(msg.member?.permissions.has(command.permissionsUser ?? []) ?? false)) {
                return msg.reply({ content: `You require! the permission(s)\n> ${userPerms}\nTo use this command` });

            }

            const clientPerms = formatPermsArray(command.permissionsBot as PermissionString[]);

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

        }
    }
};