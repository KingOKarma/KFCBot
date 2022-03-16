// import { CONFIG } from "../../../globals";
import { SlashCommands } from "../../../interfaces/slashCommands";

export const slashCommand: SlashCommands = {
    description: "Get some quick info all about me",
    group: "Utility",
    guildOnly: true,
    name: "info",
    run: async ({ client, intr }) => {

        // const prefixCommand = CONFIG.prefix;

        const guilds = (await client.guilds.fetch()).size;
        const channels = client.channels.cache.size;
        const users = client.users.cache.size;
        const commands = client.slashCommands.size;
        const clientTimestamp = client.timestampParse(client.user?.createdTimestamp.toString() ?? "");

        const clientAV = client.user?.displayAvatarURL({ dynamic: true }) ?? "";
        const owners = {
            karma: "406211463125008386",
            melosh: "355993074117115914",
            caden: "597884706897264681"
        };


        const karma = await client.users.fetch(owners.karma);
        const melosh = await client.users.fetch(owners.melosh);
        const caden = await client.users.fetch(owners.caden);

        return client.embedReply(intr, {
            embed:
            {
                author: { name: client.user?.tag, iconURL: clientAV },
                title: "Bot Information",
                thumbnail: { url: clientAV },
                description:
                    "KFC Bucket Boy,\n> Your new best friend!"
                    + `\n> Development started around <t:${clientTimestamp}:D> about <t:${clientTimestamp}:R>\n`
                    + `\nBot Owned and Written by ${karma} **${karma.tag}**, Joined: <t:${clientTimestamp}:R>\n`
                    + `\nCo Developed by ${melosh} **${melosh.tag}**, Joined: About <t:1602437400:R>\n`
                    + `\nCo Developed by ${caden} **${caden.tag}**, Joined: <t:1620328860:R>\n\n`,
                fields: [

                    { name: "Command Count", value: `> **${commands} commands**`, inline: true },
                    { name: "Watching", value: `> **${guilds} guilds**`, inline: true },
                    { name: "Serving", value: `> **~${users} users**`, inline: true },
                    { name: "Looking at", value: `> **~${channels} channels**`, inline: true },
                    { name: "Library", value: "> **Discord.js**", inline: true },
                    { name: "Language", value: "> **Typescript**", inline: true },
                    { name: "Support Server", value: "> **[Click Here](https://support.bucketbot.dev)**", inline: true },
                    { name: "Invite Me", value: "> **[Click Here](https://invite.bucketbot.dev)**", inline: true },
                    { name: "Website", value: "> **[Click Here](https://bucketbot.dev)**", inline: true },
                    { name: "Top.gg", value: "> **[Click Here](https://top.gg/bot/614110037291565056)**", inline: true },
                    { name: "Donate", value: `> **[Click Here](https://donatebot.io/checkout/872903648068374598?buyer=${intr.user.id})**`, inline: true },
                    { name: "Free RAM", value: "> **[Click Here](https://www.youtube.com/watch?v=dQw4w9WgXcQ)**", inline: true }
                ]

            }
        });

    }
};
