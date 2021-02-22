import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import { ModLogs } from "../../entity/modlogs";
import { User } from "../../entity/user";
import { getMember } from "../../bot/utils";
import { getRepository } from "typeorm";

// Creates a new class (being the command) extending off of the commando client
export default class KickCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            args: [
                {
                    key: "memberID",
                    prompt: "Which member are you kicking?",
                    type: "string"
                },
                {
                    default: "No Reason given",
                    key: "reason",
                    prompt: "What's the reason for kicking this user?",
                    type: "string"
                }
            ],
            clientPermissions: ["EMBED_LINKS", "KICK_MEMBERS"],
            description: "Kick any member (so long as you have perms)",
            group: "staff",
            guildOnly: true,
            memberName: "kick",
            name: "kick",
            throttling: {
                duration: 3,
                usages: 2
            },
            userPermissions: ["KICK_MEMBERS"]
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

        if (msg.guild.me === null) {
            return msg.say("There was a problem please report it to the developers?");
        }

        let guildicon = msg.guild.iconURL({ dynamic: true });
        if (guildicon === null) {
            guildicon = "";
        }

        const member = getMember(memberID, msg.guild);

        if (member === undefined) {
            return msg.say("I can't find that member");
        }

        if (member.id === msg.author.id) {
            return msg.say("If you really want to kick yourself why not just leave?");
        }

        if (member.id === msg.guild.me.id) {
            return msg.say("Now that wouldn't be very smart if i let myself kick myself ):");
        }

        if (!member.manageable) {
            return msg.say(`I was unable to kick **${member.user.tag}** as my role is below their highest`);
        }
        if (!member.kickable) {
            return msg.say(`I am unable to kick ${member.user.tag}`);
        }


        let user = await userRepo.findOne({ serverId: msg.guild.id, uid: member.id } );

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

        const date = new Date();

        const newModLog = new ModLogs();
        newModLog.uid = member.user.id;
        newModLog.serverid = member.guild.id;
        newModLog.reason = reason;
        newModLog.tag = member.user.tag;
        newModLog.time = date.toUTCString();
        newModLog.type = "kick";
        newModLog.user = user;
        newModLog.modID = msg.author.id;
        newModLog.modTag = msg.author.tag;
        void modLogsRepo.save(newModLog);

        void member.kick(reason);
        void member.user.send(`You have been kicked from **${msg.guild.name}** for ${reason}`)
            .catch(() => void msg.say("The User's DMs were closed so I could not tell them they were kicked"));


        const embed = new MessageEmbed()
            .setTitle(`${member.user.tag} was kicked`)
            .setDescription(`${reason}`)
            .setAuthor(member.user.tag, member.user.displayAvatarURL( { dynamic: true }))
            .setThumbnail(guildicon)
            .setColor(msg.guild.me.displayColor);


        return msg.say(embed);


    }
}