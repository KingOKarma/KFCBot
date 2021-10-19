import { globalEmotes, slashCommandTypes } from "../../globals";
import { MessageEmbed } from "discord.js";
import { SlashCommands } from "../../interfaces/slashCommands";
import { User } from "../../entity/user";
import dbUtils from "../../utils/dbUtils";
import { getRepository } from "typeorm";
import { ItemMeta } from "../../entity/item";

export const slashCommand: SlashCommands = {
    description: "show your bal or someone elses",
    guildOnly: true,
    name: "bal",
    options: [
        {
            description: "the user to check",
            name: "user",
            required: false,
            type: slashCommandTypes.user
        }
    ],
    async run (client, ir): Promise<void> {
        const userRepo = getRepository(User);
        const target = ir.options.getUser("user");

        if ( ir.member === null )
            return;

        let user = await userRepo.findOne({ where: { uid: target === null ? ir.user.id : target.id } });

        if (!user && target !== null) {
            user = await dbUtils.createUser(ir, userRepo, true, "user");
        } else if (!user) {
            user = await dbUtils.createUser(ir, userRepo);
        }

        userRepo.find({})

        const embed = new MessageEmbed()
            .setColor("BLUE")
            .setTitle("Currency")
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            .setAuthor(user.tag, user.avatar !== null ? user.avatar : undefined)
            .setDescription(`Nuggies banked **${user.nuggies} **${globalEmotes.chickenNuggie}`)
            .setTimestamp();

        return ir.reply({ embeds: [embed] });
    }
};