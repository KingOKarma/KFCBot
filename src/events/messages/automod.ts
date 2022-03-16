import ExtendedClient from "../../client/client";
import { Message } from "discord.js";


export async function messageAutomod(client: ExtendedClient, msg: Message): Promise<void | Message> {
    if (msg.author.bot || !msg.guild) return;

    const guild = client.guildCache.get(msg.guild.id);

    if (!guild) return;

    if (!guild.automodEnabled) return;


    if (guild.bannedWords.length > 0) {
        guild.bannedWords.forEach(async (w) => {
            if (msg.content.match(w)) {
                try {
                    await client.embedReply(msg, { embed: { description: `**⚠️ Warning: ${msg.author} Do not say banned words **` } }).then(async (m) => {

                        setTimeout(async () => {
                            try {
                                await m.delete();

                            } catch (err) { }

                        }, 5000);
                    });

                    return await msg.delete();
                } catch (err) { }

            }

        });
    }

    if (guild.bannedLinks.length > 0) {
        guild.bannedLinks.forEach(async (w) => {
            if (msg.content.match(w)) {
                await client.embedReply(msg, { embed: { description: `**⚠️ Warning: ${msg.author} Do not send banned links **` } }).then(async (m) => {

                    setTimeout(async () => {
                        try {
                            await m.delete();

                        } catch (err) { }
                    }, 5000);
                });

                try {

                    return await msg.delete();
                } catch (err) { }

            }

        });
    }
}
