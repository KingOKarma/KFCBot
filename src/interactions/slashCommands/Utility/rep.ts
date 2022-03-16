import { CONFIG, slashCommandTypes } from "../../../globals";
import { GlobalUser } from "../../../entity/globalUser";
import { SlashCommands } from "../../../interfaces/slashCommands";
import { getRepository } from "typeorm";
import ms from "ms";

const timeOut: Map<string, number> = new Map();

export const slashCommand: SlashCommands = {
    description: "Give reputation to other users and yourself on a time limit!",
    group: "Utility",
    name: "rep",
    options: [
        {
            description: "The user you wish to rep",
            name: "user",
            type: slashCommandTypes.user
        }
    ],
    run: async ({ client, intr }) => {

        const isdev = CONFIG.owners.some((checkDev) => checkDev === intr.user.id);
        const timeout = 43200 * 1000;
        const key = `${intr.user.id}rep`;
        const found = timeOut.get(key);

        if (found && !isdev) {
            const timePassed = Date.now() - found;
            const timeLeft = timeout - timePassed;
            return client.embedReply(intr, { embed: { description: `**Whoa there you're a bit too fast there. you gotta wait another ${ms(timeLeft)} before you can rep again**` } });
        }

        let user = intr.options.getUser("user");

        if (!user) ({ user } = intr);

        let description;

        timeOut.set(key, Date.now());

        // 12 hours/1000 in miliseconds
        const HOURS = 43200;

        setTimeout(() => {
            timeOut.delete(`${intr.user.id}rep`);
            // 12 hours
        }, HOURS * 1000);

        const gUserRepo = getRepository(GlobalUser);

        let gUser = await gUserRepo.findOne({ uid: user.id } );

        if (!gUser) {
            const newGUser = new GlobalUser();
            newGUser.avatar = user.displayAvatarURL({ dynamic: true });
            newGUser.uid = user.id;
            newGUser.tag = user.tag;
            newGUser.rep = 0;
            gUser = newGUser;
        }
        gUser.rep += 1;
        void gUserRepo.save(gUser);


        if (user.id === intr.user.id) {
            description = `**${intr.user.tag}** now has ${gUser.rep} rep!`;
        } else {
            description = `${intr.user.tag} just repped **${user.tag}**, they now have ${gUser.rep} rep!`;
        }

        if (user.id === client.user?.id) {
            ({ user } = client);
            description = `Well, I appreciated the rep but I really don't need it I swear!,\nAnyways I have a total of ${gUser.rep} rep now!`;
        }

        return client.embedReply(intr, { embed: {
            author: { name: user?.tag, iconURL: user?.displayAvatarURL({ dynamic: true }) },
            thumbnail: { url: user?.displayAvatarURL({ dynamic: true }) },
            description,
            footer: { text: "You can check rep count with the profile command" }

        } });

    }
};
