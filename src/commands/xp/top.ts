import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import { CONFIG } from "../../bot/globals";
import { User } from "../../entity/user";
import { getRepository } from "typeorm";
import { userpaginate } from "../../bot/utils";

export default class TopCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["xplb"],
            args: [
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
            description: "Lists the XP leaderboard for the server!",
            group: "xp",
            guildOnly: true,
            memberName: "top",
            name: "top",
            throttling: {
                duration: 30,
                usages: 3
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { page }: { page: number; }
    ): Promise<Message | Message[]> {
        const userRepo = getRepository(User);
        const users = await userRepo.find({
            order: { id: "DESC", serverId: "DESC" },
            where: [{ serverId: msg.guild.id }]
        });
        users.sort((a, b) => b.xp - a.xp);

        users.forEach((usersArray, index) => {
            // eslint-disable-next-line no-param-reassign
            usersArray.tag = `${index + 1} || ${usersArray.tag}`;
        });
        const iteamsPaged: User[] = userpaginate(users, 9, page);

        const authorPost = users.find((user) => user.uid === msg.author.id);

        if (authorPost === undefined)
            return msg.say("There was a problem getting your user from the database, try again!");

        if (iteamsPaged.length === 0)
            return msg.say("There are no members on that page");

        const embed = new MessageEmbed()
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
            .setTitle(`${msg.guild.name}'s Leaderboard`)
            .setDescription(`You are: **${authorPost.tag}**\n with \`${authorPost.xp} XP\``)
            .setFooter(`You can find the next page with ${CONFIG.prefix}lb <page_number>`);
        iteamsPaged.forEach((user) => embed.addField(user.tag, `\`${user.xp}XP\``, true));

        return msg.say(embed);
    }
}
