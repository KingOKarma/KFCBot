import { CommandInteraction, Guild as djsGuild } from "discord.js";
import { CONFIG } from "../globals";
import { Guild } from "../entity/guild";
import { Repository } from "typeorm";
import { User } from "../entity/user";

export async function createUser(ir: CommandInteraction, repo: Repository<User>, fromSubCommand: boolean = false, subCOmmandValue: string | null = null): Promise<User> {
    const target = ir.options.getUser("user");
    const newUser = new User();
    if (ir.guild === null)
        throw new Error("Melosh Utils: create user was used without a guild");
    if (fromSubCommand && subCOmmandValue !== null && target !== null) {
        newUser.uid = target.id;
        newUser.tag = target.tag;
    } else {
        newUser.uid = ir.user.id;
        newUser.tag = ir.user.tag;
    }
    newUser.serverId = ir.guild.id;
    await repo.save(newUser);
    if (CONFIG.devEnv.isDev) {
        console.log(`created a table for ${ ir.user.username }    (${ ir.id })`);
    }
    return newUser;
}

export async function createGuild(guild: djsGuild, repo: Repository<Guild>): Promise<Guild> {
    const newGuild = new Guild();
    newGuild.serverid = guild.id;
    newGuild.name = guild.name;
    newGuild.prefix = "k!";
    newGuild.icon = guild.iconURL({ dynamic: true }) ?? "" ;
    newGuild.items = [];

    await repo.save(newGuild);
    if (CONFIG.devEnv.isDev) {
        console.log(`created a table for ${ guild.name }    (${ guild.id })`);
    }
    return newGuild;
}

export default {
    createUser
};