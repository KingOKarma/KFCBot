import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import { ModLogs } from "../../entity/modlogs";
import { User } from "../../entity/user";
import { formatMember } from "../../utils/formatMember";
import { getRepository } from "typeorm";
import { paginate } from "../../bot/utils";

// Creates a new class (being the command) extending off of the commando client
export default class ModLogsCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["modlog"],
            args: [
                {
                    default: "nouser",
                    key: "memberID",
                    prompt: "Which member are you checking the logs for?",
                    type: "string"
                },
                {
                    default: "1",
                    error: "Please only use a number for the page",
                    key: "page",
                    prompt: "What positiion are you looking for (number)",
                    type: "integer",
                    validate: (amount: number): boolean => amount >= 0
                }
            ],
            clientPermissions: ["EMBED_LINKS"],
            description: "Check the modlogs of any user in the server",
            group: "staff",
            guildOnly: true,
            memberName: "modlogs",
            name: "modlogs",
            throttling: {
                duration: 3,
                usages: 2
            },
            userPermissions: ["MANAGE_MESSAGES"]
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { memberID, page }:
        { memberID: string;
            page: number; }
    ): Promise<Message | Message[]> {
        const userRepo = getRepository(User);
        const modLogsRepo = getRepository(ModLogs);

        if (msg.guild === null) {
            return msg.say("There was a problem please report it to the developers?");
        }

        if (msg.member === null) {
            return msg.say("There was a problem please report it to the developers?");
        }

        if (msg.guild.me === null) {
            return msg.say("There was a problem please report it to the developers?");
        }

        let guildicon = msg.guild.iconURL({ dynamic: true });
        if (guildicon === null) {
            guildicon = "";
        }

        const member = formatMember(memberID);

        if (member === null) {
            return msg.say("I could not find the user.\nPlease ensure it is an @ or a user ID");
        }


        const user = await userRepo.findOne({ relations: ["userLogs"], where: { serverId: msg.guild.id, uid: member } } );

        if (user === undefined) {
            return msg.say("I could not find the user.\nPlease ensure it is an @ or a user ID");

        }
        const logs = await modLogsRepo.findOne({ serverid: msg.guild.id, uid: member, user } );

        if (!logs) {
            return msg.say(`**${user.tag}** has no logs`);
        }

        const logsPaged: ModLogs[] = paginate(user.userLogs, 15, page );

        if (logsPaged.length === 0) {
            return msg.say("There are no logs on that page");
        }

        const embed = new MessageEmbed()
            .setDescription(`<@${user.uid}> **${user.tag}**'s  logs for **${msg.guild.name}**`)
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL( { dynamic: true }))
            .setThumbnail(guildicon);
        logsPaged.forEach((userlogs) => {
            embed.addField("\u200b", `**Case#${userlogs.id}** ][ **${userlogs.type}**\n**Moderator** ${userlogs.modTag} `
            + `(${userlogs.modID})\n**Time:** at <t:${userlogs.time}:F> about <t:${userlogs.time}:R>\n**Reason** ${userlogs.reason}`);

        });
        embed.setColor(msg.guild.me.displayColor);


        return msg.say(embed);


    }
}