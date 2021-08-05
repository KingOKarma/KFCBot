import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import { ModLogs } from "../../entity/modlogs";
import { User } from "../../entity/user";
import { formatMember } from "../../utils/formatMember";
import { getRepository } from "typeorm";

// Creates a new class (being the command) extending off of the commando client
export default class ModLogsCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["dellog"],
            args: [
                {
                    key: "memberID",
                    prompt: "Which member are you removing logs for?",
                    type: "string"
                },
                {
                    error: "Please only use a case number",
                    key: "caseNumber",
                    prompt: "Which case do you wish to remove",
                    type: "integer",
                    validate: (amount: number): boolean => amount >= 0
                }
            ],
            clientPermissions: ["EMBED_LINKS"],
            description: "Removes any modlog of a user in the server",
            group: "staff",
            guildOnly: true,
            memberName: "removelog",
            name: "removelog",
            throttling: {
                duration: 3,
                usages: 2
            },
            userPermissions: ["MANAGE_GUILD"]
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { memberID, caseNumber }:
        {
            caseNumber: number;
            memberID: string;
        }
    ): Promise<Message | Message[]> {
        const userRepo = getRepository(User);
        const modLogsRepo = getRepository(ModLogs);

        if (msg.guild === null) {
            return msg.say("There was a problem please report it to the developers?")
                .then(async () => msg.delete( { timeout: 500 } ));
        }

        if (msg.member === null) {
            return msg.say("There was a problem pleaset report it to he developers?")
                .then(async () => msg.delete( { timeout: 500 } ));
        }

        if (msg.guild.me === null) {
            return msg.say("There was a problem please report it to the developers?")
                .then(async () => msg.delete( { timeout: 500 } ));
        }

        let guildicon = msg.guild.iconURL({ dynamic: true });
        if (guildicon === null) {
            guildicon = "";
        }

        const member = formatMember(memberID);

        if (member === null) {
            return msg.say("I could not find the user.\nPlease ensure it is an @ or a user ID")
                .then(async () => msg.delete( { timeout: 500 } ));
        }


        const user = await userRepo.findOne({ relations: ["userLogs"], where: { serverId: msg.guild.id, uid: member } } );

        if (user === undefined) {
            return msg.say("I could not find the user.\nPlease ensure it is an @ or a user ID")
                .then(async () => msg.delete( { timeout: 500 } ));

        }

        const logs = await modLogsRepo.findOne({ id: caseNumber, serverid: msg.guild.id, uid: member, user } );

        if (!logs) {
            return msg.say(`\`Case#${caseNumber}\` could not be found for **${user.tag}**`)
                .then(async () => msg.delete( { timeout: 500 } ));
        }

        const embed = new MessageEmbed()
            .setDescription(`<@${user.uid}> **${user.tag}**'s  logs for **${msg.guild.name}**`)
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL( { dynamic: true }))
            .setThumbnail(guildicon)
            .addField("\u200b", `\n\`\`\`DELETED\`\`\`\n**Case#${logs.id}** ][ **${logs.type}**\n**Moderator** ${logs.modTag} `
                + `(${logs.modID})\n**Time:** at <t:${logs.time}:F> about <t:${logs.time}:R>\n**Reason** ${logs.reason}`)
            .setColor(msg.guild.me.displayColor);

        if (logs.type === "ban") {
            try {
                await msg.guild.members.unban(user.uid);
                embed.addField("\u200b", "I have removed their ban along with the log");
            } catch (error) {
                console.log(`Can't unban due to \n${error}`);
            }
        }

        try {
            await modLogsRepo.delete({ id: caseNumber });

        } catch (error) {
            return msg.say("Unable to delete that log, please try again or contact staff!")
                .then(async () => msg.delete( { timeout: 500 } ));
        }

        return msg.say(embed).then(async () => msg.delete( { timeout: 500 } ));


    }
}