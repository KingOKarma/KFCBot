import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import { GlobalUser } from "../../entity/globalUser";
import { User } from "../../entity/user";
import { getMember } from "../../bot/utils";
import { getRepository } from "typeorm";
import { globalEmotes } from "../../bot/globals";


// Creates a new class (being the command) extending off of the commando client
export default class ProfileCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            args: [
                {
                    default: "",
                    key: "memberID",
                    prompt: "Which member are you looking for?",
                    type: "string"
                }
            ],
            clientPermissions: ["EMBED_LINKS"],
            description: "Check profile info on users'",
            group: "interactions",
            guildOnly: true,
            memberName: "profile",
            name: "profile",
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

        if (msg.guild === null) {
            return msg.say("There was a problem please report it to the developers?");
        }

        if (msg.member === null) {
            return msg.say("There was a problem please report it to the developers?");
        }

        if (msg.guild.me === null) {
            return msg.say("There was a problem please report it to the developers?");
        }

        let member = await getMember(memberID, msg.guild);


        if (member === null) {
            // eslint-disable-next-line prefer-destructuring
            member = msg.member;
        }

        const gUserRepo = getRepository(GlobalUser);
        const userRepo = getRepository(User);

        let gUser = await gUserRepo.findOne({ uid: member.user.id } );
        let user = await userRepo.findOne({ serverId: msg.guild.id, uid: member.user.id });

        if (!gUser) {
            const newGUser = new GlobalUser();
            newGUser.avatar = member.user.displayAvatarURL({ dynamic: true });
            newGUser.uid = member.user.id;
            newGUser.tag = member.user.tag;
            newGUser.rep = 0;
            gUser = newGUser;
            void gUserRepo.save(newGUser);
        }
        if (!user) {
            const newUser = new User();
            newUser.uid = member.user.id;
            newUser.serverId = msg.guild.id;
            newUser.avatar = member.user.displayAvatarURL({ dynamic: true });
            newUser.tag = member.user.tag;
            newUser.nuggies = 1;
            newUser.xp = 0;
            user = newUser;
            void gUserRepo.save(newUser);
        }

        let repDesc;
        let description;
        let nuggieDesc;
        let xpDesc;
        let lvlDesc;
        const totalXpCount = user.totalXp;

        if (member.user.id === msg.member.user.id) {
            description = "This is your profile";
            repDesc = `${gUser.rep} rep`;
            nuggieDesc = `${user.nuggies} ${globalEmotes.chickenNuggie}`;
            xpDesc = `${totalXpCount}`;
            lvlDesc = `${user.level}`;
        } else {
            description = `This is **${member.user.tag}'s profile**`;
            repDesc = `${gUser.rep} rep`;
            nuggieDesc = `${user.nuggies} ${globalEmotes.chickenNuggie}`;
            xpDesc = `${totalXpCount}`;
            lvlDesc = `${user.level}`;

        }

        if (member.user.id === msg.guild.me.id) {
            member = msg.guild.me;
            description = "Here is my profile";
            repDesc = `${gUser.rep} rep`;
            nuggieDesc = "I'm broke";
            xpDesc = "My power is over 9000";
            lvlDesc = "This number is so high that it's unknown";
        }
        const embed = new MessageEmbed()
            .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(description)
            .setColor(msg.guild.me.displayColor)
            .addField("Reputation", repDesc, true)
            .addField("Nuggies/Money", nuggieDesc, true)
            .addField("Server XP", xpDesc, true)
            .addField("Server Lvl", lvlDesc, true)
            .setFooter("You can check rep count with the profile command");

        return msg.say(embed);
    }
}
