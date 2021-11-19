import { DBGuild } from "../entity/guild";
import ExtendedClient from "../client/client";
import { getRepository } from "typeorm";


export async function guildRefresh(client: ExtendedClient): Promise<void> {

    const guildRepo = getRepository(DBGuild);

    const guilds = await guildRepo.find();

    guilds.forEach((g) => {
        client.guildCache.set(g.serverid, g);

    });

    setInterval(() => {
        guilds.forEach((g) => {
            client.guildCache.set(g.serverid, g);

        });
    }, 10000);
}