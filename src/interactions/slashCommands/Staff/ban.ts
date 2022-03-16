import { DBUser } from "../../../entity/user";
import { GuildMember } from "discord.js";
import { ModLogs } from "../../../entity/modlogs";
import { SlashCommands } from "../../../interfaces/slashCommands";
import { getRepository } from "typeorm";
import { slashCommandTypes } from "../../../globals";

export const slashCommand: SlashCommands = {
    description: "Ban any user of choice, so long as you have the correct perms",
    group: "Staff",
    guildOnly: true,
    name: "ban",
    permissionsBot: ["BAN_MEMBERS"],
    permissionsUser: ["BAN_MEMBERS"],
    options: [
        {
            name: "user",
            description: "User who is going to be banned",
            type: slashCommandTypes.user,
            required: true
        },
        {
            name: "reason",
            description: "The reason as to why this user is being banned",
            type: slashCommandTypes.string
        },
        {
            name: "delete-message-days",
            description: "Number of days between 0 to 7 to purge messages",
            type: slashCommandTypes.string
        }
    ],
    run: async ({ client, intr }) => {

        const userRepo = getRepository(DBUser);
        const modLogsRepo = getRepository(ModLogs);

        const member = intr.options.getMember("user", true) as GuildMember;


        if (member.id === intr.user.id) return client.embedReply(intr, { embed: { description: "If you really want to ban yourself why not just leave?" } });

        if (member.id === client.user?.id) return client.embedReply(intr, { embed: { description: "Now that wouldn't be very smart if I let myself ban myself ):" } });

        if (!member.manageable) return client.embedReply(intr, { embed: { description: `I am unable to ban ${member} (**${member.user.tag}**) as my role is below their highest` } });

        if (!member.bannable) return client.embedReply(intr, { embed: { description: `I am unable to ban ${member} (**${member.user.tag}**)` } });


        let dbuser = await userRepo.findOne({ serverId: intr.guildId ?? "", uid: member.id } );

        if (!dbuser) {
            const newUser = new DBUser();
            newUser.uid = member.user.id;
            newUser.serverId = member.guild.id;
            newUser.avatar = member.user.displayAvatarURL({ dynamic: true });
            newUser.tag = member.user.tag;
            newUser.nuggies = 1;
            await userRepo.save(newUser);
            dbuser = newUser;
        }

        const reason = intr.options.getString("reason") ?? "No reason provided";

        const newModLog = new ModLogs();
        newModLog.uid = member.user.id;
        newModLog.serverid = member.guild.id;
        newModLog.reason = reason;
        newModLog.tag = member.user.tag;
        newModLog.time = client.timestampParse(intr.createdTimestamp.toString());
        newModLog.type = "ban";
        newModLog.user = dbuser;
        newModLog.modID = intr.user.id;
        newModLog.modTag = intr.user.tag;
        await modLogsRepo.save(newModLog);

        let dmSent = true;

        try {
            await member.user.send({ embeds: [{ description: `You have been banned from **${intr.guild?.name}** for\n${reason}`, color: client.primaryColour }] });
        } catch (err) {
            dmSent = false;
        }

        try {
            await member.ban({ days: intr.options.getNumber("delete-message-days") ?? 0, reason });

        } catch (err) {
            return client.embedReply(intr, { embed: { description: `Could not ban ${member} ❌ due to:\n${err}` } });
        }

        return client.embedReply(intr, { embed: {
            title: `${member.user.tag} was banned ✅`,
            description: client.trimString(`${member} was banned for\n${reason}`, 4096),
            footer: { text: dmSent ? undefined : "I could not notify them for their ban, their DM's may be closed" }
        } });


    }
};
