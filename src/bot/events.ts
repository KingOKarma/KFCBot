import { CONFIG, kfcLogs, supportGuild } from "./globals";
import { Client, Guild, Message, MessageEmbed, Presence, TextChannel } from "discord.js";
import { Command, CommandoClient } from "discord.js-commando";
import { GlobalUser } from "../entity/globalUser";
import { Stats } from "../entity/commandStats";
import { User } from "../entity/user";
import { Guild as entityGuild } from "../entity/guild";
import { getRepository } from "typeorm";

const xpTimeout = new Map();

export async function onReady(bot: Client): Promise<Presence | void> {
    if (!bot.user) {
        return void console.log("There was a problem with logging in");
    }
    console.log(`${bot.user.tag} is online!`);
    return bot.user.setActivity("over the KFC industry", { type: "WATCHING" });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function onMessage(msg: Message, _bot: CommandoClient): Promise<void | Message | Message[]> {
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
    } else {
        gUser.avatar = msg.author.displayAvatarURL({ dynamic: true });
        gUser.uid = msg.author.id;
        gUser.tag = msg.author.tag;
        void gUserRepo.save(gUser);
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
            user.totalXp += xpGain;
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
            user.totalXp += xpGain;
            user.xp += xpGain;

            xpTimeout.set(msg.author.id, "1");
            setTimeout(() => {
                xpTimeout.delete(msg.author.id);
            }, 5 * 2000);
            void userRepo.save(user);
        }
    }

}

export async function onGuildJoin(guild: Guild): Promise<Presence | void> {

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
        + `\nOwner: **${guild.owner?.user.tag}**\nMemberCount: **${guild.memberCount}**`);

    void homeLogs.send(embed);

}

export async function onGuildLeave(guild: Guild): Promise<Presence | void> {

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
        + `\nOwner: **${guild.owner?.user.tag}**\nMemberCount: **${guild.memberCount}**`);

    void homeLogs.send(embed);

}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function onCommandRun(cmd: Command) {

    // Checks if the command was written wrong
    if (cmd.memberName === "unknown-command")
        return;

    const date = new Date();
    const statsRepo = getRepository(Stats);

    const stats = await statsRepo.findOne({
        date: `${date.getMonth()}-${date.getFullYear()}`,
        name: cmd.memberName.toLowerCase()
    });

    if (!stats) {
        const newStats = new Stats();
        newStats.name = cmd.memberName.toLowerCase();
        newStats.date = `${date.getMonth()}-${date.getFullYear()}`;
        newStats.uses = 1;

        return statsRepo.save(newStats);
    }

    stats.uses += 1;
    return statsRepo.save(stats);
}