import { CONFIG, kfcLogs, supportGuild } from "./globals";
import { Client, Guild, Message, MessageEmbed, Presence, TextChannel } from "discord.js";
import { CommandoGuild } from "discord.js-commando";
import { GlobalUser } from "../entity/globalUser";
import { User } from "../entity/user";
import { Guild as entityGuild } from "../entity/guild";
import { getRepository } from "typeorm";

const xpTimeout = new Map();

export async function onReady(bot: Client): Promise<Presence | void> {
    if (!bot.user) {
        return void console.log("There was a problem with logging in");
    }
    console.log(`${bot.user.tag} is online!`);
    return bot.user.setActivity("me cuz I got a new updated bros", { type: "WATCHING" });
}

export async function onMessage(msg: Message): Promise<void | Message | Message[]> {
    if (msg.author.bot) return;
    if (msg.guild === null) return;
    if (msg.content.toLowerCase().startsWith(`${CONFIG.prefix}`)) return;

    const userRepo = getRepository(User);
    const gUserRepo = getRepository(GlobalUser);
    const guildRepo = getRepository(entityGuild);

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
        const newGuild = new entityGuild();
        newGuild.serverid = msg.guild.id;
        newGuild.name = msg.guild.name;
        void guildRepo.save(newGuild);
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
        void gUserRepo.save(newGUser);
        gUser = newGUser;
    }

    // Check if user is a premium user, if true x2 xp
    if (gUser.premium) xpGain *= multiplier;

    // Check Timeout
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!timeout) {

        // If Member doesn't exist add to DB
        if (!user) {
            const newUser = new User();
            newUser.uid = msg.author.id;
            newUser.serverId = msg.guild.id;
            newUser.avatar = msg.author.displayAvatarURL({ dynamic: true });
            newUser.tag = msg.author.tag;
            newUser.xp = xpGain;
            void userRepo.save(newUser);

            // Level up member
        } else if (user.xp + xpGain >= Math.round((user.level + 1) * 1000)) {
            const gain = Math.round((user.level + 1) * 1000) - (user.xp + xpGain);
            user.uid = msg.author.id;
            user.serverId = msg.guild.id;
            user.avatar = msg.author.displayAvatarURL({ dynamic: true });
            user.tag = msg.author.tag;
            user.xp = gain;
            user.level += 1;

            void userRepo.save(user);

            const embed = new MessageEmbed()
                .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
                .setTitle(`Congrats you level up to ${user.level}!`)
                .setTimestamp();
            return msg.channel.send(embed);

            // Default Add XP
        } else {
            user.uid = msg.author.id;
            user.serverId = msg.guild.id;
            user.avatar = msg.author.displayAvatarURL({ dynamic: true });
            user.tag = msg.author.tag;
            user.xp += xpGain;

            xpTimeout.set(msg.author.id, "1");
            setTimeout(() => {
                xpTimeout.delete(msg.author.id);
            }, 5 * 2000);
            void userRepo.save(user);
        }
    }

}

export async function onGuildJoin(guild: CommandoGuild): Promise<Presence | void> {

    const homeGuild: Guild = await guild.client.guilds.fetch(supportGuild);

    const homeLogs: TextChannel = homeGuild.channels.cache.get(kfcLogs) as TextChannel;

    if (guild.client.user === null) {
        return;
    }

    let guildicon = guild.iconURL({ dynamic: true });
    if (guildicon === null) {
        guildicon = "";
    }

    const embed = new MessageEmbed()
        .setAuthor(guild.owner?.user.tag, guild.owner?.user.displayAvatarURL( { dynamic: true }))
        .setTitle("Guild Joined!")
        .setThumbnail(guildicon)
        .setColor("GREEN")
        .setDescription(`${guild.client.user.tag} has joined \`${guild.name}\` (${guild.id})`
        + `Owner: ${guild.owner?.user.tag}\nMemberCount: ${guild.memberCount}`);

    void homeLogs.send(embed);

}

export async function onGuildLeave(guild: CommandoGuild): Promise<Presence | void> {

    const homeGuild: Guild = await guild.client.guilds.fetch(supportGuild);

    const homeLogs: TextChannel = homeGuild.channels.cache.get(kfcLogs) as TextChannel;

    if (guild.client.user === null) {
        return;
    }

    let guildicon = guild.iconURL({ dynamic: true });
    if (guildicon === null) {
        guildicon = "";
    }

    const embed = new MessageEmbed()
        .setAuthor(guild.owner?.user.tag, guild.owner?.user.displayAvatarURL( { dynamic: true }))
        .setTitle("Guild Left! ):")
        .setThumbnail(guildicon)
        .setColor("RED")
        .setDescription(`${guild.client.user.tag} has left \`${guild.name}\` (${guild.id})`
        + `Owner: ${guild.owner?.user.tag}\nMemberCount: ${guild.memberCount}`);

    void homeLogs.send(embed);

}