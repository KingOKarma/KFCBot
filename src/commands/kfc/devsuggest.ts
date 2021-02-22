import * as commando from "discord.js-commando";
import { Guild, Message, MessageEmbed, TextChannel } from "discord.js";
import { kfcSuggestions, supportGuild } from "../../bot/globals";
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

        const homeGuild: Guild = await msg.client.guilds.fetch(supportGuild);

        const homeLogs: TextChannel = homeGuild.channels.cache.get(kfcSuggestions) as TextChannel;

        const embed = new MessageEmbed();

        let isGuildAvaliable = true;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (msg.guild === null)
            isGuildAvaliable = false;

        if (isGuildAvaliable) {

            let guildicon = msg.guild.iconURL({ dynamic: true });
            if (guildicon === null)
                guildicon = "";

            if (msg.guild.client.user === null)
                return msg.say("there was a problem sorry!");

            embed.setThumbnail(guildicon);

            embed.addField("Guild Info", `**From:** \`${msg.guild.name}\`\n **Guild Owner:**`
           + ` \`${msg.guild.owner?.user.tag}\`\n**MemberCount:** \`${msg.guild.memberCount}\``) ;
        }
        embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL( { dynamic: true }));
        embed.setTitle("Suggestion");
        embed.setColor("BLUE");
        embed.setDescription(args1);

        return homeLogs.send(embed);
    }
}
