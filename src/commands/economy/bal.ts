import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import { User } from "../../entity/user";
import { chickenNuggie } from "../../bot/globals";
import { getMember } from "../../bot/utils";
import { getRepository } from "typeorm";

// Creates a new class (being the command) extending off of the commando client
export default class BalCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["bal", "money", "currency", "nuggies"],
            args: [
                {
                    default: "",
                    error: "Make sure to use a members ID or mention!",
                    key: "memberID",
                    prompt: "Which member's currency are you looking for?",
                    type: "string"
                }
            ],
            clientPermissions: ["EMBED_LINKS"],
            description: "Check the balance of a user",
            // This is the group the command is put in
            group: "economy",
            guildOnly: true,
            // This is the name of set within the group (most people keep this the same)
            memberName: "balance",
            name: "balance",
            // Ratelimits the command usage to 3 every 5 seconds
            throttling: {
                duration: 5,
                usages: 3
            }
        });
    }

    // Now to run the actual command, the run() parameters need to be defiend (by types and names)
    public async run(
        msg: commando.CommandoMessage,
        { memberID }: {memberID: string; }
    ): Promise<Message | Message[]> {
        const userRepo = getRepository(User);

        let member = getMember(memberID, msg.guild);

        if (member === undefined) {
            // eslint-disable-next-line prefer-destructuring
            member = msg.member;
        }

        const user = await userRepo.findOne({ serverId: msg.guild.id, uid: member.id } );

        if (user) {
            const embed = new MessageEmbed()
                .setColor("BLUE")
                .setTitle("Currency")
                .setAuthor(user.tag, user.avatar)
                .setDescription(`Nuggies banked **${user.nuggies} **${chickenNuggie}`)
                .setTimestamp();
            return msg.channel.send(embed);
        }

        return msg.channel.send("Whoops error ```user not found``` \nThey may not have any money stored");
    }
}
