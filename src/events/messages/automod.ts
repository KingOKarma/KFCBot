import ExtendedClient from "../../client/client";
import { Message } from "discord.js";


export async function messageAutomod(client: ExtendedClient, msg: Message): Promise<void | Message> {

    console.log(msg.content);
    console.log(client.uptime);

}
