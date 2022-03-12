import { PermissionString } from "discord.js";

export function formatPermsArray(permArray: PermissionString[] | undefined): string {

    if (permArray === undefined) return "No Perms";

    let perms = `${permArray
        .map((p) => `${p
            .charAt(0)
            .toUpperCase()}${p.toLowerCase()
            .slice(1)
            .replace(/_/g, " ")}`)}`
        .replace(/,/g, ", ");
    if (perms === "") {
        perms = "No Perms";
    }

    return perms;
}