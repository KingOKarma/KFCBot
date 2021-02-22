import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";

// Creates a new class (being the command) extending off of the commando client
export default class ShuffleCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            clientPermissions: ["EMBED_LINKS"],
            description: "Shuffle a random number between 1, 2 and 3!",
            group: "kfc",
            guildOnly: true,
            memberName: "shuffle",
            name: "shuffle",
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
        const filter = (message: Message): boolean => message.author.id === msg.author.id;

        const askEmbed = new MessageEmbed();
        const message: MessageEmbed[] = [];


        askEmbed.setDescription("**__Please enter either 1, 2 or 3 to choose a bucket!__** <:KaineCute:735541745433182288>")
            .setTitle("Pick a Number!")
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL( { dynamic: true }))
            .setThumbnail(guildicon)
            .setImage("https://i.imgur.com/QcUu9EI.gif")
            .setColor(msg.guild.me.displayColor);

        await msg.say(askEmbed).then(async () => {
            await msg.channel.awaitMessages(filter, { errors: ["time"], max: 1, time: 30000 })
                .then(async (numInput) => {
                    const number = numInput.first();
                    if (number === undefined) {
                        return msg.author.send("Please dont leave your message blank");
                    }

                    if (msg.guild.me === null) {
                        return msg.say("There was a problem please report it to the developers?");
                    }

                    if (guildicon === null) {
                        guildicon = "";
                    }


                    const ranNum = Math.floor(Math.random() * 3) + 1;

                    const embed = new MessageEmbed();
                    embed.setTitle("Shuffle");
                    embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL( { dynamic: true }));
                    let winlose = false;


                    if (ranNum.toString() === number.content) {
                        winlose = true;
                    }

                    switch (winlose) {
                        case true:
                            embed.setDescription("**You win!! Great Job <:KainePog:735541671349059685>**");
                            embed.setThumbnail(guildicon);
                            embed.setImage("https://i.imgur.com/0WE4m9h.png");
                            embed.setColor(msg.guild.me.displayColor);
                            break;

                        case false:
                            embed.setDescription(`**I'm afraid that's a fail.. <:KaineShrug:735541548770525215> **\n__The real number is **${ranNum}**__`);
                            embed.setThumbnail(guildicon);
                            embed.setImage("https://i.imgur.com/zFyxGkw.png");
                            embed.setColor(msg.guild.me.displayColor);
                            break;
                    }
                    message.push(embed);

                }).catch();
        }).catch(async () => {
            const embed = new MessageEmbed();
            embed.setTitle("Timed out!");
            embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL( { dynamic: true }));
            embed.setDescription("You didn't answer me so I'll just cancel that for you");
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            embed.setColor(msg.guild.me!.displayColor);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            embed.setThumbnail(guildicon!);
            return message.push(embed);
        }) ;


        return msg.say(message[0]);


    }
}


