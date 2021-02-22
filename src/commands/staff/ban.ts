import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import { ModLogs } from "../../entity/modlogs";
import { User } from "../../entity/user";
import { getMember } from "../../bot/utils";
import { getRepository } from "typeorm";

// Const re = new RegExp("^[1-9]d$|^[1-9]m$|^[1-9]s$", "g");

// Creates a new class (being the command) extending off of the commando client
export default class BanCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            args: [
                {
                    key: "memberID",
                    prompt: "Which member are you banning?",
                    type: "string"
                },
                // {
                //     Default: "infinite",
                //     IsEmpty: (value: string): boolean => {
                //         If (value.match(re)) {
                //             Return false;
                //         }
                //         Return true;

                //     },
                //     Key: "time",
                //     Prompt: "How long are they banned for?",
                //     Type: "integer"

                // },
                {
                    default: "No Reason given",
                    key: "reason",
                    prompt: "What's the reason for banning this user?",
                    type: "string"
                }
            ],
            clientPermissions: ["EMBED_LINKS", "BAN_MEMBERS"],
            description: "Ban any member (so long as you have perms)",
            group: "staff",
            guildOnly: true,
            memberName: "ban",
            name: "ban",
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
            return msg.say("If you really want to ban yourself why not just leave?");
        }

        if (member.id === msg.guild.me.id) {
            return msg.say("Now that wouldn't be very smart if i let myself ban myself ):");
        }

        if (!member.manageable) {
            return msg.say(`I was unable to ban **${member.user.tag}** as my role is below their highest`);
        }
        if (!member.bannable) {
            return msg.say(`I am unable to ban ${member.user.tag}`);
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
        newModLog.type = "ban";
        newModLog.user = user;
        newModLog.modID = msg.author.id;
        newModLog.modTag = msg.author.tag;
        void modLogsRepo.save(newModLog);

        void member.ban({ days: 7, reason });
        void member.user.send(`You have been banned from **${msg.guild.name}** for ${reason}`)
            .catch(() => void msg.say("The User's DMs were closed so I could not tell them they were banned"));

        const embed = new MessageEmbed()
            .setTitle(`${member.user.tag} was banned`)
            .setDescription(`${reason}`)
            .setAuthor(member.user.tag, member.user.displayAvatarURL( { dynamic: true }))
            .setThumbnail(guildicon)
            .setColor(msg.guild.me.displayColor);


        return msg.say(embed);


    }
}