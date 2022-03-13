import { SlashCommands } from "../../../interfaces/slashCommands";
import { slashCommandTypes } from "../../../globals";

export const slashCommand: SlashCommands = {
    description: "Ask the 8ball any question and be told true wonders",
    group: "Fun",
    name: "8ball",
    options: [
        {
            description: "The question you are asking",
            name: "question",
            required: true,
            type: slashCommandTypes.string
        }
    ],
    run: async ({ client, intr }) => {


        let question = intr.options.getString("question") ?? "none";

        question = question.replace(/`/g, "");

        console.log(question);
        const fortunes = [
            "The KFC gods are telling me yes!",
            "Sorry ain't gonna happn",
            "This will indeed come true",
            "My Godly KFC powerrs are deciding.... YES",
            "**Bucket Boy says:** \"Nope\" <:KaineCute:735541745433182288>",
            "I mean... it might happen <:KaineShrug:735541548770525215>",
            "I'm swaying more towards no but it could happen",
            "Yeahhhhhh... no",
            "Pft idk",
            "Potentially, this may not not happen",
            "This will definitely not will not not happen <:KaineSip:735541935179038730>",
            "Can you try asking someone else? I'm busy",
            "Uhhh... Yeah? I don't know? Why are you asking me?",
            "Yes",
            "No",
            "Maybe",
            "Possibly",
            "Possibly not",
            "Try getting a higher role first then I'll tell you <:KaineKek:735541704962342953>",
            "How about no",
            "How about yes",
            "???? No clue dude",
            "I've got my own question, why are you asking a bot for some advice/fortune I mean yeah" +
            " a lot of effort into making me think of funny responses" +
            " for the 8ball command but it's just confusing you know? Like why can't you just live out" +
            " your life without needing to ask a bot with set responses to give you an answer on your" +
            " question? Anyway yeah sorry for rambling your answer was Yes"];

        const response = fortunes[Math.floor(Math.random() * fortunes.length)];
        return client.embedReply(intr, { embed: { description: response }, content: `${intr.user}'s Question\n\`\`\`${question}\`\`\``, mention: { parse: ["users"] } });
    }

};
