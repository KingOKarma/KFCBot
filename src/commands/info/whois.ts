import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import { getMember } from "../../bot/utils";

// Creates a new class (being the command) extending off of the commando client
export default class WhoisCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["whodat", "whothat"],
            args: [
                {
                    default: "",
                    key: "memberID",
                    prompt: "Which member are you hugging?",
                    type: "string"
                }
            ],
            clientPermissions: ["EMBED_LINKS"],
            description: "Check the avatar of any user!",
            group: "info",
            guarded: true,
            guildOnly: true,
            memberName: "whois",
            name: "whois",
            throttling: {
                duration: 3,
                usages: 2
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { memberID }: {memberID: string;}
    ): Promise<Message | Message[]> {

        if (msg.guild.me === null) {
            return msg.say("There was a problem please report it to the developers?");
        }


        let member = getMember(memberID, msg.guild);

        if (member === undefined) {
            // eslint-disable-next-line prefer-destructuring
            member = msg.member;
        }

        if (member.joinedAt === null) {
            return msg.say("There was an error please try again!");
        }

        let presenseString;
        switch (member.presence.status) {
            case "online":
                presenseString = "Online <:Online:813085501997318184>";
                break;

            case "offline":
                presenseString = "Offline <:Offline:813085510947045427>";
                break;

            case "idle":
                presenseString = "Idle <:Idle:813085529917751301>";
                break;

            case "dnd":
                presenseString = "DnD <:DnD:813085519075606548>";
                break;

            case "invisible":
                presenseString = "Invisible <:Invisible:813085537702772796>";
                break;

        }

        let roles = `**${member.roles.cache
            .filter((r) => r.id !== msg.guild.id)
            .map((r) => `<@&${r.id}>`).join(" ")
        }**`;

        if (roles === "****") {
            roles = "No Roles";
        }

        const permsArray = member.permissions.toArray();
        let perms = `${permsArray
            .map((p) => `${p
                .charAt(0)
                .toUpperCase()}${p.toLowerCase()
                .slice(1)
                .replace(/_/g, " ")}`)}`
            .replace(/,/g, ", ");
        if (perms === "") {
            perms = "No Perms";
        }

        const embed = new MessageEmbed()
            .setTitle("User Info")
            .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true, size: 4096 }))
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setColor(msg.guild.me.displayColor)
            .setDescription(`Info for **${member}** (**${member.user.id}**)\n`
            + `**[📛] Tag** ][ ${member.user.tag}\n`
            + `**[🌐] Presence** ][ ${presenseString}\n`
            + `**[📆] Joined ${msg.guild.name} at** ${member.joinedAt.toUTCString()}\n`
            + `**[📃] Joined Discord at** ${member.user.createdAt.toUTCString()}\n`)
            .addField("[🧮] Roles", roles)
            .addField("[📰] Permissions", perms);

        return msg.say(embed);
    }
}

