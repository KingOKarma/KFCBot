import { CommandInteraction } from "discord.js";
import ExtendedClient from "../../../../client/client";

export async function toggle(client: ExtendedClient, intr: CommandInteraction): Promise<void> {


    return intr.reply({ content: "Autmod Toggle" });


}
