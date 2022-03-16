import { EmbedFieldData, GuildMember, MessageEmbedOptions } from "discord.js";
import { DBUser } from "../../../entity/user";
import { ModLogs } from "../../../entity/modlogs";
import { SlashCommands } from "../../../interfaces/slashCommands";
import { getRepository } from "typeorm";
import { slashCommandTypes } from "../../../globals";

export const slashCommand: SlashCommands = {
    description: "Remove any modlogs from users",
    group: "Staff",
    guildOnly: true,
    name: "removelog",
    permissionsUser: ["MANAGE_GUILD"],
    options: [
        {
            name: "user",
            description: "Which user's Logs are you removing",
            type: slashCommandTypes.user,
            required: true
        },
        {
            name: "case-number",
            description: "the case number from /modlogs",
            type: slashCommandTypes.number,
            required: true
        }
    ],
    run: async ({ client, intr }) => {

        const userRepo = getRepository(DBUser);
        const modLogsRepo = getRepository(ModLogs);

        const member = intr.options.getMember("user", true) as GuildMember;
        const caseNumber = intr.options.getNumber("case-number", true);

        let dbuser = await userRepo.findOne({ relations: ["userLogs"], where: { serverId: intr.guildId ?? "", uid: member.id } } );

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

        const logs = await modLogsRepo.findOne({ id: caseNumber, serverid: intr.guildId ?? "", uid: member.id, user: dbuser } );

        if (!logs) return client.embedReply(intr, { embed: { description: `\`Case#${caseNumber}\` could not be found for **${dbuser.tag}**` }, ephemeral: true });


        const fields: EmbedFieldData[] = [];

        fields.push({ name: "\u200b", value: `\n\`\`\`DELETED\`\`\`\n**Case#${logs.id}** ][ **${logs.type}**\n**Moderator** ${logs.modTag} `
                + `(${logs.modID})\n**Time:** at <t:${logs.time}:F> about <t:${logs.time}:R>\n**Reason** ${logs.reason}` });

        if (logs.type === "ban") {
            try {
                await intr.guild?.members.unban(dbuser.uid);
                fields.push({ name: "\u200b", value: "I have removed their ban along with the log" });
            } catch (error) {
                console.log(`Can't unban due to \n${error}\nIt's possible they're not currently banned`);
            }
        }

        try {
            await modLogsRepo.delete({ id: caseNumber });

        } catch (error) {
            return client.embedReply(intr, { embed: { description: "Unable to delete that log, please try again or contact staff!" }, ephemeral: true });
        }


        const embed: MessageEmbedOptions = {
            description: `<@${dbuser.uid}> **${dbuser.tag}**'s  logs for **${intr.guild?.name}**`,
            author: { name: member.user.tag, iconURL: member.user.displayAvatarURL({ dynamic: true }) }

        };

        return client.embedReply(intr, { embed });


    }
};
