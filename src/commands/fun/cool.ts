import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";

// Creates a new class (being the command) extending off of the commando client
export default class CoolCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            clientPermissions: ["EMBED_LINKS"],
            description: "I'll show you a video on how to be cool!",
            group: "fun",
            memberName: "cool",
            name: "cool",
            throttling: {
                duration: 3,
                usages: 2
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage
    ): Promise<Message | Message[]> {

        const embed = new MessageEmbed()

            .setAuthor(`${msg.author.tag}`, `${msg.author.displayAvatarURL()}`)
            .setColor("BLUE")
            .setTitle("Cool Tutorial")
            .setDescription("😎")
            .addField("Click the video to learn how to be cool!", "https://youtu.be/dQw4w9WgXcQ");
        return msg.say(embed);
    }
}
