import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import { getMember, userlogspaginate } from "../../bot/utils";
import { ModLogs } from "../../entity/modlogs";
import { User } from "../../entity/user";
import { getRepository } from "typeorm";

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

        if (msg.guild.me === null) {
            return msg.say("There was a problem please report it to the developers?");
        }

        let guildicon = msg.guild.iconURL({ dynamic: true });
        if (guildicon === null) {
            guildicon = "";
        }

        let member = getMember(memberID, msg.guild);

        if (member === undefined) {
            // eslint-disable-next-line prefer-destructuring
            member = msg.member;
        }


        let user = await userRepo.findOne({ relations: ["userLogs"], where: { serverId: msg.guild.id, uid: member.id } } );
        const logs = await modLogsRepo.findOne({ serverid: msg.guild.id, uid: member.id, user } );

        if (!logs) {
            return msg.say(`**${member.user.tag}** has no logs`);
        }

        if (!user) {
            const newUser = new User();
            newUser.uid = member.user.id;
            newUser.serverId = member.user.id;
            newUser.avatar = member.user.displayAvatarURL({ dynamic: true });
            newUser.tag = member.user.tag;
            newUser.nuggies = 1;
            void userRepo.save(newUser);
            user = newUser;
        }

        const logsPaged: ModLogs[] = userlogspaginate(user.userLogs, 15, page );

        if (logsPaged.length === 0) {
            return msg.say("There are no logs on that page");
        }

        const embed = new MessageEmbed()
            .setDescription(`${member.user.tag}'s  logs for ${msg.guild.name}`)
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL( { dynamic: true }))
            .setThumbnail(guildicon);
        logsPaged.forEach((userlogs) => {
            embed.addField("\u200b", `**Case#${userlogs.id}** ][ **${userlogs.type}**\n**Moderator** ${userlogs.modTag} `
            + `(${userlogs.modID})\n**Time:** ${userlogs.time}\n**Reason** ${userlogs.reason}`);

        });
        embed.setColor(msg.guild.me.displayColor);


        return msg.say(embed);


    }
}