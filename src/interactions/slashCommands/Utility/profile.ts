import { DBUser } from "../../../entity/user";
import { GlobalUser } from "../../../entity/globalUser";
import { SlashCommands } from "../../../interfaces/slashCommands";
import { getRepository } from "typeorm";
import { slashCommandTypes } from "../../../globals";

export const slashCommand: SlashCommands = {
    description: "Check your profile stats",
    group: "Utility",
    name: "profile",
    options: [
        {
            description: "The user's profile you are checking",
            name: "user",
            type: slashCommandTypes.user
        }
    ],
    run: async ({ client, intr }) => {

        let user = intr.options.getUser("user");

        if (!user) ({ user } = intr);


        const gUserRepo = getRepository(GlobalUser);
        const userRepo = getRepository(DBUser);

        let gUser = await gUserRepo.findOne({ uid: user.id } );
        let dbUser = await userRepo.findOne({ serverId: intr.guildId ?? "", uid: user.id });

        if (!gUser) {
            const newGUser = new GlobalUser();
            newGUser.avatar = user.displayAvatarURL({ dynamic: true });
            newGUser.uid = user.id;
            newGUser.tag = user.tag;
            newGUser.rep = 0;
            gUser = newGUser;
            await gUserRepo.save(newGUser);
        }
        if (!dbUser) {
            const newUser = new DBUser();
            newUser.uid = user.id;
            newUser.serverId = intr.guildId ?? "";
            newUser.avatar = user.displayAvatarURL({ dynamic: true });
            newUser.tag = user.tag;
            newUser.nuggies = 1;
            newUser.xp = 0;
            dbUser = newUser;
            await gUserRepo.save(newUser);
        }

        const totalXpCount = dbUser.totalXp;
        let description;
        let repDesc = `${client.sepThousands(gUser.rep)} rep`;
        let nuggieDesc = `${client.sepThousands(dbUser.nuggies)} ${client.emotes.chickenNuggie}`;
        let xpDesc = `${client.sepThousands(totalXpCount)}`;
        let lvlDesc = `${client.sepThousands(dbUser.level)}`;

        if (user.id === intr.user.id) {
            description = "This is your profile";
        } else {
            description = `This is **${user.tag}'s** (${user}) Profile`;

        }

        if (user.id === client.user?.id) {
            ({ user } = client) ;
            description = "Here is my profile";
            repDesc = `${gUser.rep} rep`;
            nuggieDesc = "I'm broke";
            xpDesc = "My power is over 9000";
            lvlDesc = "This number is so high that it's unknown";
        }

        return client.embedReply(intr, { embed: {
            author: { name: user?.tag, iconURL: user?.displayAvatarURL( { dynamic: true }) },
            description,
            thumbnail: { url: user?.displayAvatarURL( { dynamic: true }) },
            fields: [
                { name: "Reputation", value: repDesc, inline: true },
                { name: "Nuggies/Money", value: nuggieDesc, inline: true },
                { name: "Server XP", value: xpDesc, inline: true },
                { name: "Server Level", value: lvlDesc, inline: true }

            ]
        } });
    }
};
