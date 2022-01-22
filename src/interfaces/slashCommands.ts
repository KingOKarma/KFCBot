/* eslint-disable @typescript-eslint/member-ordering */
import { ApplicationCommandOptionData, CommandInteraction, PermissionResolvable } from "discord.js";
import { DBGuild } from "../entity/guild";
import ExtendedClient from "../client/client";

interface CommandRun {
    client: ExtendedClient;
    intr: CommandInteraction;
    dbGuild?: DBGuild;
}

type Run = (command: CommandRun) => void;

export interface SlashCommands {
    cooldown?: number;
    cooldownResponse?: string;
    name: string;
    description: string;
    dmOnly?: boolean;
    guildOnly?: boolean;
    options?: ApplicationCommandOptionData[];
    defaultPermission?: boolean;
    permissionsUser?: PermissionResolvable[];
    permissionsBot?: PermissionResolvable[];
    group: string;
    devOnly?: boolean;
    run: Run;

}
