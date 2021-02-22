import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import { CONFIG } from "../../bot/globals";
import { GlobalUser } from "../../entity/globalUser";
import { getMember } from "../../bot/utils";
import { getRepository } from "typeorm";
import ms from "ms";

const timeOut = new Map();
const devs = CONFIG.owners;

// Creates a new class (being the command) extending off of the commando client
export default class RepCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["+"],
            args: [
                {
                    default: "",
                    key: "memberID",
                    prompt: "Which member are you repping?",
                    type: "string"
                }
            ],
            clientPermissions: ["EMBED_LINKS"],
            description: "You can give rep to a user or yourself",
            group: "interactions",
            guildOnly: true,
            memberName: "rep",
            name: "rep",
            throttling: {
                duration: 3,
                usages: 2
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { memberID }: { memberID: string; }
    ): Promise<Message | Message[]> {
        const isdev = devs.some((checkDev) => checkDev === msg.author.id);
        const timeout = 43200 * 1000;
        const key = `${msg.author.id}work`;
        const found = timeOut.get(key);

        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (found && !isdev) {
            const timePassed = Date.now() - found;
            const timeLeft = timeout - timePassed;
            return msg.say(`**Whoa there you're a bit too fast there. you gotta wait another ${ms(timeLeft)}!**`);
        }

        if (msg.guild.me === null) {
            return msg.say("There was a problem please report it to the developers?");
        }

        let member = getMember(memberID, msg.guild);
        let description;

        if (member === undefined) {
            // eslint-disable-next-line prefer-destructuring
            member = msg.member;
        }
        timeOut.set(key, Date.now());

        // 12 hours/1000 in miliseconds
        const HOURS = 43200;

        setTimeout(() => {
            timeOut.delete(msg.author.id);
            // 12 hours
        }, HOURS * 1000);

        const gUserRepo = getRepository(GlobalUser);

        let gUser = await gUserRepo.findOne({ uid: member.user.id } );

        if (!gUser) {
            const newGUser = new GlobalUser();
            newGUser.avatar = member.user.displayAvatarURL({ dynamic: true });
            newGUser.uid = member.user.id;
            newGUser.tag = member.user.tag;
            newGUser.rep = 0;
            gUser = newGUser;
        }
        gUser.rep += 1;
        void gUserRepo.save(gUser);


        if (member === msg.member) {
            description = `**${msg.author.tag}** just got ${gUser.rep} rep!`;
        } else {
            description = `${msg.author.tag} just repped **${member.user.tag}**, they got ${gUser.rep} rep!`;
        }

        if (member.user.id === msg.guild.me.id) {
            member = msg.guild.me;
            description = `Well, I appreciated the rep but I really don't need it I swear!, anyway I have ${gUser.rep} rep`;

        }
        const embed = new MessageEmbed()
            .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(description)
            .setColor(msg.guild.me.displayColor)
            .setFooter(`You can check rep count with ${msg.guild.commandPrefix}profile`);

        return msg.say(embed);
    }
}
