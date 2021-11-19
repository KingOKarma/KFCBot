import ExtendedClient from "../../client/client";
import { Message } from "discord.js";


export async function messageAutomod(client: ExtendedClient, msg: Message): Promise<void | Message> {
    if (msg.author.bot || !msg.guild) return;

    const guild = client.guildCache.get(msg.guild.id);

    if (!guild) return;

    if (!guild.automodEnabled) return;

    const checkMsg = new RegExp(msg.content);

    const { bannedWords, bannedLinks } = guild;
    bannedWords.forEach(async (w) => {
        if (checkMsg.exec(w)) {
            try {
                await client.reply(msg, { content: "**Please do not say banned words**" }).then(async (m) => {

                    if (!m) return;

                    setTimeout(async () => {
                        await m.delete();
                    }, 5000);
                });

                return await msg.delete();
            } catch (err) {}

        }

    });

    bannedLinks.forEach(async (w) => {
        if (checkMsg.exec(w)) {
            await client.reply(msg, { content: "**Please do not send links from banned domains**" }).then(async (m) => {
                if (!m) return;

                setTimeout(async () => {
                    await m.delete();
                }, 5000);
            });

            try {

                return await msg.delete();
            } catch (err) {}

        }

    });

}
