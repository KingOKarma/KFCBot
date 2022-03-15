import { commandHandler, messageXP } from "./messages";
import { Event } from "../interfaces";
import { Message } from "discord.js";
import { messageAutomod } from "./messages/automod";


export const event: Event = {
    name: "messageCreate",
    run: async (client, msg: Message) => {

        if (msg.content === `<@${client.user?.id}>` || msg.content === `<@!${client.user?.id}>`) {
            return client.commands.get("help")?.run(client, msg, []);
        }

        await commandHandler(client, msg);
        await messageXP(client, msg);
        await messageAutomod(client, msg);
    }
};