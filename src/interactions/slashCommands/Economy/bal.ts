import { DBUser } from "../../../entity/user";
import { SlashCommands } from "../../../interfaces/slashCommands";
import { getRepository } from "typeorm";
import { slashCommandTypes } from "../../../globals";


export const slashCommand: SlashCommands = {
    // Note aliases are optional
    description: "Check yours or another users balance!",
    group: "Economy",
    name: "bal",
    options: [
        {
            description: "User to check the balance of",
            name: "user",
            type: slashCommandTypes.user
        }
    ],
    guildOnly: true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async ({ client, intr }) => {

        let user = intr.options.getUser("user");

        if (!user) ({ user } = intr);

        const userRepo = getRepository(DBUser);


        const dbUser = await userRepo.findOne({ where: { serverId: intr.guildId, uid: user.id } });

        if (dbUser) {

            return client.embedReply(intr, {
                embed: {
                    title: "Currency",
                    author: { name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true }) },
                    description: `Nuggies banked **${client.sepThousands(dbUser.nuggies)}${client.currencyEmoji} **`, timestamp: intr.createdTimestamp
                }
            });

        }

        return client.embedReply(intr, { embed: { description: `Whoops error\n\`\`\`diff\n- User not found\`\`\`\n${user} may not have any money stored` }, ephemeral: true });
    }
};
