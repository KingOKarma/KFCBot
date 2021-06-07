import * as commando from "discord.js-commando";
import { Guild, Message, MessageEmbed, TextChannel } from "discord.js";
import { globalIDs } from "../../bot/globals";
// Creates a new class (being the command) extending off of the commando client
export default class DevSuggestCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            // Creates aliases
            aliases: ["dev"],
            // These are your arguments
            args: [
                {
                    key: "args1",
                    prompt: "Give me something to send to the developer!!",
                    type: "string"
                }
            ],
            description: "Suggest anything towards the developer!!",
            group: "kfc",
            memberName: "devsuggest",
            name: "devsuggest",
            throttling: {
                duration: 5,
                usages: 3
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { args1 }: { args1: string; }
    ): Promise<Message | Message[]> {


        const homeGuild: Guild = await msg.client.guilds.fetch(globalIDs.guilds.supportGuild);

        const homeLogs: TextChannel = homeGuild.channels.cache.get(globalIDs.channels.kfcSuggestions) as TextChannel;

        const embed = new MessageEmbed();

        let guildicon: string | null = "https://logos-world.net/wp-content/uploads/2020/12/Discord-Logo.png";
        if (msg.guild !== null) {
            guildicon = msg.guild.iconURL({ dynamic: true });

            if (guildicon === null) {
                guildicon = "https://logos-world.net/wp-content/uploads/2020/12/Discord-Logo.png";
            }


            embed.addField("Guild Info", `**From:** \`${msg.guild.name}\`\n **Guild Owner:**`
            + ` \`${msg.guild.owner?.user.tag}\`\n**MemberCount:** \`${msg.guild.memberCount}\``) ;
        }
        embed.setThumbnail(guildicon);
        embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL( { dynamic: true }));
        embed.setTitle("Suggestion");
        embed.setColor("BLUE");
        embed.setDescription(args1);

        void msg.author.send("I have just sent your suggestion to the devs over at discord.gg/nQRC3SR, it can be viewed at <#699030000753442867>");
        return homeLogs.send(embed);
    }
}
