import { DBUser } from "../../../entity/user";
import { GuildMember } from "discord.js";
import { ModLogs } from "../../../entity/modlogs";
import { SlashCommands } from "../../../interfaces/slashCommands";
import { getRepository } from "typeorm";
import { slashCommandTypes } from "../../../globals";

export const slashCommand: SlashCommands = {
    description: "Warn any user for bad doing, so long as you have the correct perms",
    group: "Staff",
    guildOnly: true,
    name: "warn",
    permissionsBot: ["KICK_MEMBERS"],
    permissionsUser: ["KICK_MEMBERS"],
    options: [
        {
            name: "user",
            description: "User who is going to be warned",
            type: slashCommandTypes.user,
            required: true
        },
        {
            name: "reason",
            description: "The reason as to why this user is being warned",
            type: slashCommandTypes.string
        }
    ],
    run: async ({ client, intr }) => {

        const userRepo = getRepository(DBUser);
        const modLogsRepo = getRepository(ModLogs);

        const member = intr.options.getMember("user", true) as GuildMember;


        if (member.id === client.user?.id) return client.embedReply(intr, { embed: { description: "Trying to warn me are we? smh" } });

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
        newModLog.type = "warn";
        newModLog.user = dbuser;
        newModLog.modID = intr.user.id;
        newModLog.modTag = intr.user.tag;
        await modLogsRepo.save(newModLog);

        let dmSent = true;

        try {
            await member.user.send({ embeds: [{ description: `You have been warned in **${intr.guild?.name}** for\n${reason}`, color: client.primaryColour }] });
        } catch (err) {
            dmSent = false;
        }

        return client.embedReply(intr, { embed: {
            title: `${member.user.tag} was warned ✅`,
            description: client.trimString(`${member} was warned for\n${reason}`, 4096),
            footer: { text: dmSent ? undefined : "I could not notify them for their warn, their DM's may be closed" }
        } });


    }
};
