import * as commando from "discord.js-commando";
import { CONFIG, chickenNuggie } from "../../bot/globals";
import { Message, MessageEmbed } from "discord.js";

// Creates a new class (being the command) extending off of the commando client
export default class PremiumCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            clientPermissions: ["EMBED_LINKS"],
            description: "Check premium perks and bonuses!!",
            group: "info",
            guarded: true,
            guildOnly: true,
            memberName: "premium",
            name: "premium",
            throttling: {
                duration: 3,
                usages: 2
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage
    ): Promise<Message | Message[]> {

        if (msg.guild.me === null) {
            return msg.say("There was a problem please report it to the developers?");
        }

        let guildicon = msg.guild.iconURL({ dynamic: true });
        if (guildicon === null) {
            guildicon = "";
        }

        const embed = new MessageEmbed()
            .setTitle("Premium Bucket")
            .setThumbnail(guildicon)
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
            .setColor(msg.guild.me.displayColor)
            .setDescription("Currently the only method of getting premium is by donating monthly and asking the developer directly after donating (he will know 👀)")
            .addField("Perks!", "Ability to amp up servers with a boost giving them more than just 15 shop slots!")
            .addField("\u200b", `**2x** XP and Nuggies ${chickenNuggie} earned PLUS when in an amped server premium users get **3x** and normal users get **2x**`)
            .addField("\u200b", "Access to the exlusive \"Premium\" group commands!")
            .addField("\u200b", "Think about it? you'll be supporting my dad and I in our fight to keep me alive!")
            .addField("Where is the dev though?", `You can find my dad by doing \`${CONFIG.prefix}invite\` and joining the support server`)
            .addField("Where can I donate?", `[Right Here!](https://donatebot.io/checkout/605859550343462912?buyer=${msg.author.id})`)
            .setFooter("More perks can be added! Feel free to suggest them and help grow the bot!");


        return msg.say(embed);
    }
}

