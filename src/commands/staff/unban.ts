import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import { ModLogs } from "../../entity/modlogs";
import { User } from "../../entity/user";
import { formatMember } from "../../utils/formatMember";
import { getRepository } from "typeorm";

// Const re = new RegExp("^[1-9]d$|^[1-9]m$|^[1-9]s$", "g");

// Creates a new class (being the command) extending off of the commando client
export default class BanCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            args: [
                {
                    key: "memberID",
                    prompt: "Which member are you unbanning?",
                    type: "string"
                },
                {
                    default: "No Reason given",
                    key: "reason",
                    prompt: "What's the reason for unbanning this user?",
                    type: "string"
                }
            ],
            clientPermissions: ["EMBED_LINKS", "BAN_MEMBERS"],
            description: "Unban any member (so long as you have perms)",
            group: "staff",
            guildOnly: true,
            memberName: "unban",
            name: "unban",
            throttling: {
                duration: 3,
                usages: 2
            },
            userPermissions: ["BAN_MEMBERS"]
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { memberID, reason }:
        { memberID: string;
            reason: string; }
    ): Promise<Message | Message[]> {
        const userRepo = getRepository(User);
        const modLogsRepo = getRepository(ModLogs);

        if (msg.guild === null) {
            return msg.say("There was a problem please report it to the developers?")
                .then(async () => msg.delete( { timeout: 500 } ));
        }

        if (msg.member === null) {
            return msg.say("There was a problem please report it to the developers?")
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
            return msg.say("I can't find that member").then(async () => msg.delete( { timeout: 500 } ));
        }

        const user = await userRepo.findOne({ serverId: msg.guild.id, uid: member } );

        if (!user) {
            return msg.say("I can't find that member").then(async () => msg.delete( { timeout: 500 } ));
        }

        const newModLog = new ModLogs();
        newModLog.uid = user.uid;
        newModLog.serverid = msg.guild.id;
        newModLog.reason = reason;
        newModLog.tag = user.tag;
        newModLog.time = msg.createdTimestamp.toString().slice(0, 10);
        newModLog.type = "ban";
        newModLog.user = user;
        newModLog.modID = msg.author.id;
        newModLog.modTag = msg.author.tag;
        await modLogsRepo.save(newModLog);
        let bannedMember;
        try {
            bannedMember = await msg.guild.members.unban(user.uid);

        } catch (error) {
            return msg.say(`I was unable to unban <@${user.uid}> **${user.tag}**`).then(async () => msg.delete( { timeout: 500 } ));
        }
        let invite = "";

        if (msg.channel.type === "text") {
            invite = ` You can rejoin here: ${(await msg.channel.createInvite({ maxUses: 1 })).url}`;
        }

        await bannedMember.send(`You have been unbanned from **${msg.guild.name}** for ${reason}\n${invite}`)
            .catch(async () => msg.say("The User's DMs were closed so I could not tell them they were unbanned"));

        const embed = new MessageEmbed()
            .setTitle(`${user.tag} was unbaned`)
            .setDescription(`${reason}`)
            .setAuthor(user.tag, user.avatar)
            .setThumbnail(guildicon)
            .setColor(msg.guild.me.displayColor);

        return msg.say(embed).then(async () => msg.delete( { timeout: 500 } ));


    }
}