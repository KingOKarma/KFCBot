import { DBUser } from "../../../entity/user";
import { GuildMember } from "discord.js";
import { ModLogs } from "../../../entity/modlogs";
import { SlashCommands } from "../../../interfaces/slashCommands";
import { getRepository } from "typeorm";
import { slashCommandTypes } from "../../../globals";

export const slashCommand: SlashCommands = {
    description: "Unban any user, so long as you have the correct perms",
    group: "Staff",
    guildOnly: true,
    name: "unban",
    permissionsBot: ["BAN_MEMBERS"],
    permissionsUser: ["BAN_MEMBERS"],
    options: [
        {
            name: "user",
            description: "User ID of the user who is going to be Unbaned",
            type: slashCommandTypes.user,
            required: true
        },
        {
            name: "reason",
            description: "The reason as to why this user is being Unbaned",
            type: slashCommandTypes.string
        }
    ],
    run: async ({ client, intr }) => {

        const userRepo = getRepository(DBUser);
        const modLogsRepo = getRepository(ModLogs);

        const member = intr.options.getMember("user", true) as GuildMember;


        if (member.id === client.user?.id) return client.embedReply(intr, { embed: { description: "But I'm right here... what? how can you unban me" } });

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
        newModLog.type = "unban";
        newModLog.user = dbuser;
        newModLog.modID = intr.user.id;
        newModLog.modTag = intr.user.tag;
        await modLogsRepo.save(newModLog);

        let dmSent = true;

        try {
            await member.user.send({ embeds: [{ description: `You have been unbanned in **${intr.guild?.name}** for\n${reason}`, color: client.primaryColour }] });
        } catch (err) {
            dmSent = false;
        }

        try {
            await intr.guild?.members.unban(dbuser.uid);
        } catch (err) {
            return client.embedReply(intr, { embed: { description: `Could not unban ${member} ❌ due to:\n${err}` } });
        }

        return client.embedReply(intr, { embed: {
            title: `${member.user.tag} was unbanned ✅`,
            description: client.trimString(`${member} was unbanned for\n${reason}`, 4096),
            footer: { text: dmSent ? undefined : "I could not notify them for their unban, their DM's may be closed" }
        } });


    }
};
