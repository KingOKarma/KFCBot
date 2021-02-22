import * as commando from "discord.js-commando";
import { CONFIG } from "../../bot/globals";
import { GlobalUser } from "../../entity/globalUser";
import { Guild } from "../../entity/guild";
import { Message } from "discord.js";
import { User } from "../../entity/user";
import { getRepository } from "typeorm";
import ms from "ms";

const timeOut = new Map();
const devs = CONFIG.owners;

export default class WorkCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            description: "Work to become a world renowned KFC worker",
            group: "economy",
            guildOnly: true,
            memberName: "work",
            name: "work",
            throttling: {
                duration: 3,
                usages: 4
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage
    ): Promise<Message | Message[]> {

        const userRepo = getRepository(User);
        const gUserRepo = getRepository(GlobalUser);
        const guildRepo = getRepository(Guild);

        let guild = await guildRepo.findOne( { serverid: msg.guild.id });
        let user = await userRepo.findOne({ serverId: msg.guild.id, uid: msg.author.id });
        let gUser = await gUserRepo.findOne({ uid: msg.author.id } );

        // If there is no Guild then add to  DB
        if (!guild) {
            const newGuild = new Guild();
            newGuild.serverid = msg.guild.id;
            newGuild.name = msg.guild.name;
            void guildRepo.save(newGuild);
            guild = newGuild;
        }

        if (!user) {
            const newUser = new User();
            newUser.uid = msg.author.id;
            newUser.serverId = msg.guild.id;
            newUser.avatar = msg.author.displayAvatarURL({ dynamic: true });
            newUser.tag = msg.author.tag;
            newUser.nuggies = 1;
            user = newUser;
        }

        // Return msg.say("There was a problem getting your user from the database, try again!");

        if (!gUser) {
            const newGUser = new GlobalUser();
            newGUser.avatar = msg.author.displayAvatarURL({ dynamic: true });
            newGUser.uid = msg.author.id;
            newGUser.tag = msg.author.tag;
            void gUserRepo.save(newGUser);
            gUser = newGUser;
        }

        const isdev = devs.some((checkDev) => checkDev === msg.author.id);
        const timeout = 21600 * 1000;
        const key = `${msg.author.id}work`;
        const found = timeOut.get(key);

        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (found && !isdev) {
            const timePassed = Date.now() - found;
            const timeLeft = timeout - timePassed;
            return msg.say(`**Whoa there you're a bit too fast there. you gotta wait another ${ms(timeLeft)}!**`);
        }

        // Generate earnings and add multipliers
        let earn = Math.floor(Math.random() * 200 - 100) + 100;
        earn *= user.level > 10 ? Math.floor(user.level / 15) : 1;

        // If server boosted then x2 and let premium user get 3x
        let multiplier = 2;
        if (guild.boosted) {
            earn *= multiplier;
            multiplier += 1;
        }

        if (gUser.premium) earn = Math.floor(earn * multiplier);

        const random = Math.floor(Math.random() * CONFIG.workStrings.length);
        const newbal = user.nuggies + earn;
        let workString = CONFIG.workStrings[random];

        workString = workString.replace("{bal}", earn.toString());
        workString = workString.replace("{totalbal}", newbal.toString());
        workString = workString.replace("{user}", `${msg.author}`);
        timeOut.set(key, Date.now());

        // 6 hours/1000 in miliseconds
        const HOURS = 21600;

        setTimeout(() => {
            timeOut.delete(msg.author.id);
            // 6 hours
        }, HOURS * 1000);

        user.nuggies += earn;
        await userRepo.manager.save(user);

        return msg.say(workString);
    }
}
