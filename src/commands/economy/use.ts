import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import { CONFIG } from "../../bot/globals";
// Import { Guild } from "../../entity/guild";
import { Inventory } from "../../entity/inventory";
// Import { ItemMeta } from "../../entity/item";
import { User } from "../../entity/user";
import { getRepository } from "typeorm";

// Creates a new class (being the command) extending off of the commando client
export default class UseItemCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["activate", "interact"],
            args: [
                {
                    error: "Make sure that the name is EXACTLY the same as it appears on the shop",
                    key: "itemName",
                    prompt: "Which item do you wish to use?",
                    type: "string"
                }
            ],
            clientPermissions: ["EMBED_LINKS"],
            description: "Use's an item in a user's inventory",
            // This is the group the command is put in
            group: "economy",
            guildOnly: true,
            // This is the name of set within the group (most people keep this the same)
            memberName: "use",
            name: "use",
            // Ratelimits the command usage to 3 every 5 seconds
            throttling: {
                duration: 3,
                usages: 3
            }
        });
    }

    // Now to run the actual command, the run() parameters need to be defiend (by types and names)
    public async run(
        msg: commando.CommandoMessage,
        { itemName }: {itemName: string; }
    ): Promise<Message | Message[]> {
        const userRepo = getRepository(User);
        const invRepo = getRepository(Inventory);

        let user = await userRepo.findOne({ serverId: msg.guild.id, uid: msg.author.id } );
        const inv = await invRepo.findOne({ serverid: msg.guild.id, uid: msg.author.id });

        if (!user) {
            const newUser = new User();
            newUser.uid = msg.author.id;
            newUser.serverId = msg.guild.id;
            newUser.avatar = msg.author.displayAvatarURL({ dynamic: true });
            newUser.tag = msg.author.tag;
            newUser.nuggies = 1;
            void userRepo.save(newUser);
            user = newUser;
        }

        if (!inv) {
            return msg.say("You don't seem to have an inventory, make sure to buy something from the shop first!");
        }

        const index = inv.items.indexOf(itemName, 0);
        if (index > -1) {
            inv.items.splice(index, 1);
        }
        void invRepo.save(inv);


        let guildicon = msg.guild.iconURL({ dynamic: true });
        if (guildicon === null) {
            guildicon = "";
        }


        const embed = new MessageEmbed()
            .setThumbnail(guildicon)
            .setColor("BLUE")
            .setTitle("Currency")
            .setAuthor(user.tag, user.avatar)
            .setDescription(`The item **${itemName}** was ysed by **${msg.author.tag}** (${msg.author.id}) in **${msg.guild.name}** (${msg.guild.id})`)
            .setFooter(`You can use ${CONFIG.prefix}inv to check what other items you have`)
            .setTimestamp();
        return msg.channel.send(embed);

    }
}
