import * as commando from "discord.js-commando";
import { Message } from "discord.js";
// Creates a new class (being the command) extending off of the commando client
export default class FortuneCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["8b", "fortune"],
            args: [
                {
                    key: "ask",
                    prompt: "What fortune do you want me to read?",
                    type: "string"
                }
            ],
            description: "I will read out the fotune of the user",
            group: "fun",
            memberName: "8ball",
            name: "8ball",
            throttling: {
                duration: 3,
                usages: 2
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage
    ): Promise<Message | Message[]> {

        const fortune = [
            "The KFC gods are telling me yes!",
            "Sorry ain't gonna happn",
            "This will indeed come true",
            "My KFC powerrs are deciding.... YES",
            "**Bucket Boy says:** \"Nope\" <:KaineCute:735541745433182288>",
            "I mean... it might happen <:KaineShrug:735541548770525215>",
            "I'm swaying more towards no but it could happen",
            "Yeahhhhhh... no",
            "Pft idk",
            "Possibly this may not not happen",
            "This will definitely not will not not happen <:KaineSip:735541935179038730>",
            "Can you try asking someone else? I'm busy",
            "ummm... yes? I don't know? why are you asking me?",
            "yes",
            "no",
            "maybe",
            "possibly",
            "possibly not",
            "try getting a higher role first then I'll tell you <:KaineKek:735541704962342953>",
            "how about no",
            "how about yes",
            "???? no clue dude",
            "I've got my own question, why are you asking a bot for some advice/fortune I mean yes" +
            " the creator put a lot of effort into making this bot and thinking of funny responses" +
            " for the 8ball command but it's just confusing you know? like why can't you just live out" +
            " your life without needing to ask a bot with set responses to give you an answer on your" +
            " question? anyway yeah sorry for rambling your answer was yes"];

        const random = fortune[Math.floor(Math.random() * fortune.length)];
        return msg.say(random);
    }
}
