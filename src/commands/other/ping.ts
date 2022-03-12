import { Command } from "../../interfaces";

export const command: Command = {
    // Note aliases are optional
    aliases: ["p"],
    description: "Omega Test!",
    example: ["!ping"],
    group: "other",
    name: "ping",
    run: async (client, msg) => {
        // Run your code here
        return client.embedReply(msg, {
            embed: {
                description: `**Bot Latency**: ${Date.now() - msg.createdTimestamp}ms \n**API Latency**: ${Math.round(client.ws.ping)}ms`
            }
        });
    }
};