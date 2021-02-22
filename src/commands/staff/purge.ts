import * as commando from "discord.js-commando";
import { Message, TextChannel } from "discord.js";

// Creates a new class (being the command) extending off of the commando client
export default class PurgeCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["cleanse", "clear"],
            args: [
                {
                    default: "1",
                    error: "Please only use a number for the purge amount (between 1 and 100)",
                    key: "amount",
                    prompt: "What positiion are you looking for (number)",
                    type: "integer",
                    validate: (amount: number): boolean => amount >= 1 && amount <= 100
                }
            ],
            clientPermissions: ["EMBED_LINKS"],
            description: "Warn any user (so long as you have perms)",
            group: "staff",
            guildOnly: true,
            memberName: "purge",
            name: "purge",
            throttling: {
                duration: 3,
                usages: 2
            },
            userPermissions: ["MANAGE_MESSAGES"]
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { amount }:
        { amount: number;}
    ): Promise<Message | Message[] | null> {

        if (msg.guild.me === null) {
            return msg.say("There was a problem please report it to the developers?");
        }

        let guildicon = msg.guild.iconURL({ dynamic: true });
        if (guildicon === null) {
            guildicon = "";
        }


        if (amount === 100) {
            amount = 99;
        }
        const fetched = await msg.channel.messages.fetch({ limit: amount + 1 });
        const channel = msg.channel as TextChannel;
        await channel.bulkDelete(fetched)
            .catch(async (error) => msg.say(`Couldn't delete messages because of: ${error}`));

        // Const embed = new MessageEmbed()
        //     .setDescription(`Just purged ${amount} messages!`)
        //     .setAuthor(msg.author.tag, msg.author.displayAvatarURL( { dynamic: true }))
        //     .setThumbnail(guildicon)
        //     .setColor(msg.guild.me.displayColor);
        // Console.log(msg.responses);

        return null;


    }
}