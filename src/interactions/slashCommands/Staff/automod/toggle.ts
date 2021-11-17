import { CommandInteraction, Message } from "discord.js";
import ExtendedClient from "../../../../client/client";

export async function toggle(client: ExtendedClient, intr: CommandInteraction): Promise<void | Message> {


    return client.reply(intr, { content: "Autmod Toggle" });


}
