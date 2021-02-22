import * as axios from "axios";
import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import { CONFIG } from "../../bot/globals";
import { ranNum } from "../../bot/utils";

// Creates a new class (being the command) extending off of the commando client
export default class ImageCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["img", "search"],
            args: [
                {
                    key: "search",
                    prompt: "What image are you looking for?",
                    type: "string"
                }
            ],
            description: "I'll look for any image from https://serpapi.com/images-results",
            group: "image",
            memberName: "image",
            name: "image",
            throttling: {
                duration: 3,
                usages: 2
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { search }: { search: string; }
    ): Promise<Message | Message[]> {


        const ranIndexNumber = ranNum(5, 0);


        const options = {
            headers: {
                "x-rapidapi-host": "contextualwebsearch-websearch-v1.p.rapidapi.com",
                "x-rapidapi-key": CONFIG.xRapidapiKey
            },
            method: "GET" as axios.Method,
            params: {
                autoCorrect: "true",
                pageNumber: ranIndexNumber,
                pageSize: "10",
                q: search,
                safeSearch: "true"
            },

            url: "https://contextualwebsearch-websearch-v1.p.rapidapi.com/api/Search/ImageSearchAPI"


        };

        axios.default.request(options).then(async (response) => {

            if (msg.guild.me === null) {
                return msg.say("There was a problem please report it to the developers?");
            }

            if (response.data.value[ranIndexNumber] === undefined) {
                return msg.say("There was a problem with grabbing that image please try again!");
            }

            const embed = new MessageEmbed()
                .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
                .setDescription(`Image possibly related to ${search}`)
                .setImage(response.data.value[ranIndexNumber].url)
                .setColor(msg.guild.me.displayColor)
                .setFooter("This image was obtained from https://rapidapi.com/contextualwebsearch/api/web-search");

            return msg.say(embed);
        }).catch(async (error) => {
            console.error(error);
            return msg.say("Sorry I've been ratelimited, try again tomorrow!");
        });
        return msg.say("Just grabbing your image real quick...");


    }
}
