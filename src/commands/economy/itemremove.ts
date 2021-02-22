import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import { CONFIG } from "../../bot/globals";
import { Guild } from "../../entity/guild";
import { ItemMeta } from "../../entity/item";
import { getRepository } from "typeorm";

export default class RemoveShopItemCommand extends commando.Command {
    public constructor(client: commando.Client) {
        super(client, {
            aliases: ["delitem", "itemdel", "removeitem"],
            args: [
                {
                    error: "The ID is listed on the item",
                    key: "itemID",
                    prompt: "What's the Item's ID",
                    type: "integer",
                    validate: (text: string): boolean => text.length < 21
                }
            ],
            clientPermissions: ["EMBED_LINKS"],
            description: "Removes an item from your server shop",
            group: "economy",
            guildOnly: true,
            memberName: "itemremove",
            name: "itemremove",
            throttling: {
                duration: 5,
                usages: 3
            },
            userPermissions: ["MANAGE_GUILD"]

        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { itemID }: {
            itemID: number;

        }
    ): Promise<Message | Message[]> {
        const itemsDB = getRepository(ItemMeta);
        const guildDB = getRepository(Guild);

        const guild = await guildDB.findOne({ relations: ["shop"], where: { serverid: msg.guild.id } });
        const items = await itemsDB.findOne({ guild, id: itemID });

        if (!guild) {
            return msg.say(`The shop is currently empty please ask someone with "Manage Server" permissions to run \`${CONFIG.prefix}additem\``);
        }

        if (items) {
            void itemsDB.delete(itemID);


        } else {
            return msg.say("That item doesn't exist, please make sure you are typing the correct ID");

        }


        let guildicon = msg.guild.iconURL({ dynamic: true });
        if (guildicon === null) {
            guildicon = "";
        }

        const emebd = new MessageEmbed()
            .setColor("BLUE")
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL( { dynamic: true }))
            .setTitle(`${msg.guild.name}'s removed item!`)
            .setThumbnail(guildicon)
            .setDescription(`**${items.name}** was Removed`);

        return msg.say(emebd);

    }
}