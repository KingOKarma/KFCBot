import { MessageEmbed } from "discord.js";
import { SlashCommands } from "../../../../interfaces/slashCommands";
import { getRepository } from "typeorm";
import { slashCommandTypes } from "../../../../globals";

export const slashCommand: SlashCommands = {
    defaultPermission: false,
    description: "checkdb",
    devOnly: true,
    name: "checkdb",
    options: [
        {
            choices: [
                {
                    name: "commandStats",
                    value: "commandStats"
                },
                {
                    name: "globalUser",
                    value: "globalUser"
                },
                {
                    name: "guild",
                    value: "guild"
                },
                {
                    name: "inv",
                    value: "inventory"
                },
                {
                    name: "item",
                    value: "item"
                },
                {
                    name: "modlogs",
                    value: "modlogs"
                },
                {
                    name: "user",
                    value: "user"
                }
            ],
            description: "db",
            name: "table",
            required: true,
            type: slashCommandTypes.string
        },
        {
            description: "where",
            name: "where",
            required: true,
            type: slashCommandTypes.string
        },
        {
            description: "get many?",
            name: "get many",
            type: slashCommandTypes.boolean
        }
    ],
    async run (client, ir) {
        await ir.deferReply({ ephemeral: true });
        const choice = ir.options.getString("table", true);
        const query = ir.options.getString("where", true);
        const getMany = ir.options.getBoolean("get many") ?? false;

        try {
            const repo = getRepository(choice).createQueryBuilder(choice);
            repo.where(query);
            const embed = new MessageEmbed()
                .setTitle(`query on table: ${ choice}`)
                .setDescription(`table: ${choice}
where query: ${query}
get many: ${getMany}

Results:`);

            if (getMany){
                const result = await repo.getMany();
                const count = 0;
                result.forEach((i) => {
                    embed.addField(`Result: ${ count.toString()}`, i as string, true);
                });
            } else {
                const result = await repo.getOne();
                embed.addField("result 1:", result as string, true);
            }
            void ir.editReply({ embeds: [embed] });
        } catch (e) {
            void ir.editReply({ content: "borken query check logs" });
            console.log(e);
        }


    }
};