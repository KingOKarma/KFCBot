/* eslint-disable @typescript-eslint/no-unused-vars */
import { SlashCommands } from "../../interfaces/slashCommands";

export const slashCommand: SlashCommands = {
    description: "causes an error to happen",
    name: "error",
    run (_client, _ir) {
        throw new Error("Purposely caused error");
    }
};