import * as commando from "discord.js-commando";
import { CONFIG, chickenNuggie } from "../../bot/globals";
import { Message, MessageEmbed } from "discord.js";
import { Guild } from "../../entity/guild";
import { ItemMeta } from "../../entity/item";
import { getRepository } from "typeorm";

export default class ItemInfoCommand extends commando.Command {
    private constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["iteminfo"],
            args: [
                {
                    error: "Make sure that the name is EXACTLY the same as it appears on the shop",
                    key: "itemName",
                    prompt: "What is the name of the item you are looking for",
                    type: "string"
                }
            ],
            clientPermissions: ["EMBED_LINKS"],
            description: "displays the server shop",
            group: "economy",
            guildOnly: true,
            memberName: "item",
            name: "item",
            throttling: {
                duration: 3,
                usages: 3
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { itemName }: { itemName: string; }
    ): Promise<Message | Message[]> {
        const guildRepo = getRepository(Guild);
        const itemsRepo = getRepository(ItemMeta);

        const guild = await guildRepo.findOne({ serverid: msg.guild.id } );
        const item = await itemsRepo.findOne( { guild, name: itemName });

        if (!guild) {
            return msg.say(`The shop is currently empty please ask someone with "Manage Server" permissions to run \`${CONFIG.prefix}additem\``);
        }

        if (!item) {
            return msg.say("This item does not exist, make sure you are typing the EXACT name");
        }

        let guildicon = msg.guild.iconURL({ dynamic: true });
        if (guildicon === null) {
            guildicon = "";
        }

        const embed = new MessageEmbed();
        embed.setColor("BLUE");
        embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }));
        embed.setTitle(`${msg.guild.name}'s Item Info`);
        embed.addField("Name", `${item.name}`, true);
        embed.addField("Description", `${item.description}`, true);
        embed.addField("Price", `${item.price} ${chickenNuggie} Nuggie(s)`, true);
        embed.addField("Stock left", `${item.max}`, true);
        embed.addField("ID", `${item.id}`, true);

        embed.setFooter("If there is a problem with an item please report it's ID number to the dev");
        embed.setThumbnail(guildicon);

        return msg.channel.send(embed);
    }
}
