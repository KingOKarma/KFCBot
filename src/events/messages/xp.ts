import { Message, MessageEmbed } from "discord.js";
import { DBGuild } from "../../entity/guild";
import { DBUser } from "../../entity/user";
import ExtendedClient from "../../client/client";
import { GlobalUser } from "../../entity/globalUser";
import { getRepository } from "typeorm";

const xpTimeout = new Map();

export async function messageXP(client: ExtendedClient, msg: Message): Promise<void | Message> {
    if (msg.author.bot || !msg.guild) return;

    const userRepo = getRepository(DBUser);
    const gUserRepo = getRepository(GlobalUser);
    const guildRepo = getRepository(DBGuild);

    let guild = await guildRepo.findOne( { serverid: msg.guild.id });
    const user = await userRepo.findOne({ serverId: msg.guild.id, uid: msg.author.id });
    let gUser = await gUserRepo.findOne( { uid: msg.author.id } );
    const timeout = xpTimeout.get(msg.author.id);
    let xpGain = Math.ceil(msg.content.length * 2);

    // If above 10, set 10
    if (xpGain > 11) {
        xpGain = Math.ceil(+10);
    }

    // If there is no Guild then add to  DB
    if (!guild) {
        const newGuild = new DBGuild();
        newGuild.serverid = msg.guild.id;
        newGuild.name = msg.guild.name;
        await guildRepo.save(newGuild);
        guild = newGuild;
    }

    // If server boosted then x2 and let premium user get 3x
    let multiplier = 2;
    if (guild.boosted) {
        xpGain *= multiplier;
        multiplier += 1;
    }

    // If there is no GlobalUser then add to  DB
    if (!gUser) {
        const newGUser = new GlobalUser();
        newGUser.avatar = msg.author.displayAvatarURL({ dynamic: true });
        newGUser.uid = msg.author.id;
        newGUser.tag = msg.author.tag;
        await gUserRepo.save(newGUser);
        gUser = newGUser;
    } else {
        gUser.avatar = msg.author.displayAvatarURL({ dynamic: true });
        gUser.uid = msg.author.id;
        gUser.tag = msg.author.tag;
        await gUserRepo.save(gUser);
    }

    // Check if user is a premium user, if true x2 xp
    if (gUser.premium) xpGain *= multiplier;

    // Check Timeout
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!timeout) {

        // If Member doesn't exist add to DB
        if (!user) {
            const newUser = new DBUser();
            newUser.uid = msg.author.id;
            newUser.serverId = msg.guild.id;
            newUser.avatar = msg.author.displayAvatarURL({ dynamic: true });
            newUser.tag = msg.author.tag;
            newUser.xp = xpGain;
            await userRepo.save(newUser);

            // Level up member
        } else if (user.xp + xpGain >= Math.round((user.level + 1) * 1000)) {
            const gain = Math.round((user.level + 1) * 1000) - (user.xp + xpGain);
            user.uid = msg.author.id;
            user.serverId = msg.guild.id;
            user.avatar = msg.author.displayAvatarURL({ dynamic: true });
            user.tag = msg.author.tag;
            user.xp = gain;
            user.totalXp += xpGain;
            user.level += 1;

            await userRepo.save(user);

            const embed = new MessageEmbed()
                .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
                .setTitle(`Congrats you level up to ${user.level}!`)
                .setTimestamp();
            return msg.reply( { embeds: [embed] } );

            // Default Add XP
        } else {
            user.uid = msg.author.id;
            user.serverId = msg.guild.id;
            user.avatar = msg.author.displayAvatarURL({ dynamic: true });
            user.tag = msg.author.tag;
            user.totalXp += xpGain;
            user.xp += xpGain;

            xpTimeout.set(msg.author.id, "1");
            setTimeout(() => {
                xpTimeout.delete(msg.author.id);
            }, 5 * 2000);
            await userRepo.save(user);
        }
    }

}