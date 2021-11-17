import { commandHandler, messageXP } from "./messages";
import { Event } from "../interfaces";
import { Message } from "discord.js";


export const event: Event = {
    name: "messageCreate",
    run: async (client, msg: Message) => {

        void commandHandler(client, msg);
        void messageXP(client, msg);
    }
};