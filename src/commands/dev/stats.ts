import * as Canvas from "canvas";
import * as commando from "discord.js-commando";
import { Message, MessageAttachment, MessageEmbed } from "discord.js";
import { Stats } from "../../entity/commandStats";
import { getRepository } from "typeorm";


const date = new Date();
// Creates a new class (being the command) extending off of the commando client
export default class StatsCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            // Creates aliases
            args: [
                {
                    key: "command",
                    prompt: "which command do you want to see the stats for",
                    type: "string",
                    validate: (arg: String): Boolean => {
                        return this.client.registry.commands.some((cmd) => {
                            return cmd.memberName.toLowerCase() === arg.toLowerCase();
                        });
                    }
                }
            ],
            description: "get stats of specific comamnd",
            group: "dev",
            memberName: "stats",
            name: "stats",
            ownerOnly: true,
            throttling: {
                duration: 5,
                usages: 3
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { command }: {command: string;}
    ): Promise<Message | Message[]> {
        const statsRepo = getRepository(Stats);
        const thisMonth = await statsRepo.findOne({
            date: `${date.getMonth()}-${date.getFullYear()}`,
            name: command
        });
        const lastMonth = await statsRepo.findOne({
            date: `${date.getMonth() - 1}-${date.getFullYear()}`,
            name: command
        });
        const embed = new MessageEmbed()
            .setTitle(command)
            .setTimestamp();

        if (!lastMonth && !thisMonth){
            embed.addField("Error", "there was no stats found for this command");
            return msg.say(embed);
        }


        if (thisMonth) {
            embed.addField("This Month", `this command has been run ${thisMonth.uses} times`);
        } else {
            embed.addField("This month", "no stats where found for this month");
        }

        if (lastMonth) {
            embed.addField("Last month", `this command was run ${lastMonth.uses} times`);
        } else {
            embed.addField("Last month", "no stats where found for last month");
        }


        if (lastMonth && thisMonth) {
            if (!thisMonth.uses) return msg.say("That user doesn't have any xp stored!");
            const procent = thisMonth.uses / lastMonth.uses;
            console.log(1);
            console.log(procent);
            const canvas = Canvas.createCanvas(700, 250);

            const ctx = canvas.getContext("2d");
            const lineFill = Math.round(canvas.width - 40 * procent);
            console.log(lineFill);

            ctx.fillStyle = "#171717";
            ctx.fillRect(0, 0, canvas.width, canvas.height);


            ctx.strokeStyle = "#363636";
            ctx.lineWidth = 10;
            ctx.strokeRect(15, 50, canvas.width - 30, canvas.height - 65);
            ctx.fillStyle = "#ffbb00";
            ctx.fillRect(20, 55, lineFill, canvas.height - 75);

            ctx.font = "30px sans-serif";
            ctx.fillStyle = "white";
            ctx.fillText(`${(procent * 100).toFixed(2)}%`, 20, 40);


            const img = new MessageAttachment(canvas.toBuffer(), "image.jpeg");
            embed.attachFiles([img]);
        }
        return msg.say(embed);


    }
}
