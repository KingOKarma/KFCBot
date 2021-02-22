import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import { CONFIG } from "../../bot/globals";
import { Guild } from "../../entity/guild";
import { ItemMeta } from "../../entity/item";
import { getRepository } from "typeorm";
import { shoppaginate } from "../../bot/utils";

export default class ShopCommand extends commando.Command {
    private constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["market"],
            args: [
                {
                    default: "1",
                    error: "Please only use a number for the page",
                    key: "page",
                    prompt: "What positiion are you looking for (number)",
                    type: "integer",
                    validate: (amount: number): boolean => amount >= 0
                }
            ],
            clientPermissions: ["EMBED_LINKS"],
            description: "displays the server shop",
            group: "economy",
            guildOnly: true,
            memberName: "shop",
            name: "shop",
            throttling: {
                duration: 3,
                usages: 3
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { page }: { page: number; }
    ): Promise<Message | Message[]> {
        const guildRepo = getRepository(Guild);
        const guild = await guildRepo.findOne({ relations: ["shop"], where: { serverid: msg.guild.id } });
        if (!guild) {
            return msg.say(`The shop is currently empty please ask someone with "Manage Server" permissions to run \`${CONFIG.prefix}additem\``);
        }

        const iteamsPaged: ItemMeta[] = shoppaginate(guild.shop, 9, page);

        if (iteamsPaged.length === 0) {
            return msg.say("There are no items on that page");
        }

        let guildicon = msg.guild.iconURL({ dynamic: true });
        if (guildicon === null) {
            guildicon = "";
        }

        const embed = new MessageEmbed();
        iteamsPaged.forEach((item) => {
            let text = `In Stock: ${item.max}` ;
            if (item.max === 0) {
                text = "|| OUT OF STOCK ||";
            }
            embed.addField(item.name, `${item.description}\n\`\`\`Price: ${item.price} Nuggie(s)\n${text}\nID: ${item.id}\`\`\``);
        });
        embed.setColor("BLUE");
        embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }));
        embed.setTitle(`${msg.guild.name}'s Server Shop`);
        embed.setFooter("If there is a problem with an item please report it's ID number to the dev");
        embed.setThumbnail(guildicon);

        return msg.channel.send(embed);
    }
}
