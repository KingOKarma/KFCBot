import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import { getMember } from "../../bot/utils";

// Creates a new class (being the command) extending off of the commando client
export default class AvatarCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["av", "displaypicture"],
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
            memberName: "avatar",
            name: "avatar",
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

        const embed = new MessageEmbed()
            .setTitle("Avatar")
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true, size: 4096 }))
            .setColor(msg.guild.me.displayColor)
            .setDescription(`Avatar for **${member.user.tag}**`)
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .setImage(member.user.displayAvatarURL( { dynamic: true, size: 4096 }));

        return msg.say(embed);
    }
}

