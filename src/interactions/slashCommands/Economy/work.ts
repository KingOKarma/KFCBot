import { CONFIG } from "../../..//globals";
import { DBUser } from "../../../entity/user";
import { GlobalUser } from "../../../entity/globalUser";
import { MessageEmbedOptions } from "discord.js";
import { SlashCommands } from "../../../interfaces/slashCommands";
import { WorkStrings } from "../../../entity/workStrings";
import { getRepository } from "typeorm";
import ms from "ms";

const timeOut = new Map();
const devs = CONFIG.owners;

export const slashCommand: SlashCommands = {
    // Note aliases are optional
    description: "Work your butt off, get currency in your pokets, climb the ranks and buy items from the shop",
    group: "Economy",
    name: "work",
    guildOnly: true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async ({ client, intr, dbGuild }) => {


        const userRepo = getRepository(DBUser);
        const gUserRepo = getRepository(GlobalUser);
        const wStringRepo = getRepository(WorkStrings);


        let user = await userRepo.findOne({ serverId: intr.guildId ?? "", uid: intr.user.id });
        let gUser = await gUserRepo.findOne({ uid: intr.user.id });
        let workStrings = await wStringRepo.find();

        if (workStrings.find((w) => w.guildId === intr.guildId)) {

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            workStrings = workStrings.filter((w) => w.guildId === intr.guildId || w.guildId === null);

        } else {

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            workStrings = workStrings.filter((w) => w.guildId === null);

        }

        if (workStrings.length === 0) return client.embedReply(intr, {
            embed: {
                description: "There was a problem getting the works strings, please contact someone"
            }, ephemeral: true
        });

        if (!user) {
            const newUser = new DBUser();
            newUser.uid = intr.user.id;
            newUser.serverId = intr.guildId ?? "";
            newUser.avatar = intr.user.displayAvatarURL({ dynamic: true });
            newUser.tag = intr.user.tag;
            newUser.nuggies = 1;
            await userRepo.save(newUser);
            user = newUser;

        }

        // Return msg.say("There was a problem getting your user from the database, try again!");

        if (!gUser) {
            const newGUser = new GlobalUser();
            newGUser.avatar = intr.user.displayAvatarURL({ dynamic: true });
            newGUser.uid = intr.user.id;
            newGUser.tag = intr.user.tag;
            await gUserRepo.save(newGUser);
            gUser = newGUser;
        }

        const isdev = devs.some((checkDev) => checkDev === intr.user.id);
        const timeout = 21600 * 1000;
        const key = `${intr.user.id}work`;
        const found = timeOut.get(key);

        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (found && !isdev) {
            const timePassed = Date.now() - found;
            const timeLeft = timeout - timePassed;
            return client.embedReply(intr, {
                embed: {
                    description: `**Whoa there you're a bit too fast there. you gotta wait another ${ms(timeLeft)} before you can work again!**`
                }, ephemeral: true
            });
        }

        // Generate earnings and add multipliers
        let earn = Math.floor(Math.random() * 200 - 100) + 100;
        earn *= user.level > 10 ? Math.floor(user.level / 15) : 1;

        // If server boosted then x2 and let premium user get 3x
        let multiplier = 2;
        if (dbGuild?.boosted ?? false) {
            earn *= multiplier;
            multiplier += 1;
        }

        if (gUser.premium) earn = Math.floor(earn * multiplier);

        const random = Math.floor(Math.random() * workStrings.length);
        const newbal = user.nuggies + earn;
        const workString = workStrings[random];

        if (workString.string.includes("{bal}")) {
            const replace = new RegExp("{bal}", "g");
            workString.string = workString.string.replace(replace, `**${client.sepThousands(earn.toString())}${client.currencyEmoji}**`);
        }

        if (workString.string.includes("{totalbal}")) {
            const replace = new RegExp("{totalbal}", "g");
            workString.string = workString.string.replace(replace, `**${client.sepThousands(newbal.toString())}${client.currencyEmoji}**`);
        }

        if (workString.string.includes("{user}")) {
            const replace = new RegExp("{user}", "g");
            workString.string = workString.string.replace(replace, `${intr.user}`);
        }

        timeOut.set(key, Date.now());

        // 6 hours/1000 in miliseconds
        const HOURS = 21600;

        setTimeout(() => {
            timeOut.delete(`${intr.user.id}work`);
            // 6 hours
        }, HOURS * 1000);

        user.nuggies += earn;
        await userRepo.manager.save(user);

        const guildicon = intr.guild?.iconURL({ dynamic: true }) ?? "";

        const embed: MessageEmbedOptions = {
            author: { name: intr.user.tag, iconURL: intr.user.displayAvatarURL({ dynamic: true }) },
            title: `Working for ${intr.guild?.name}`,
            description: workString.string,
            thumbnail: { url: guildicon },
            timestamp: intr.createdTimestamp
        };

        return client.embedReply(intr, { embed });
    }
};
