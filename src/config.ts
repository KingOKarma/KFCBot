import { dump, load } from "js-yaml";
import { CONFIG } from "./globals";
import fs from "fs";

export interface DevEnv {
    devServer: string[];
    isDev: boolean;
}

interface TopGGAuth {
    runTopgg: boolean;
    topGGKey: string;
    topGGWebhookAuth: string;
}

interface Tokens {
    botToken: string;
    tenorAPI: string;
    topGGAuth: TopGGAuth;
}

/**
 * This represents the config.yml
 * @class Config
 * @property {Tokens} tokens
 * @property {string} prefix
 * @property {string[]} owners
 */
export default class Config {
    private static readonly _configLocation = "./config.yml";

    public readonly devEnv: DevEnv;

    public readonly owners: string[];

    public readonly prefix: string;

    public readonly tokens: Tokens;

    private constructor() {
        this.devEnv = { devServer: [""], isDev: false };
        this.owners = [""];
        this.prefix = "";
        this.tokens = { botToken: "", tenorAPI: "", topGGAuth: { runTopgg: false, topGGKey: "", topGGWebhookAuth: "" } };
    }

    /**
       *  Call getConfig instead of constructor
       */
    public static getConfig(): Config {
        if (!fs.existsSync(Config._configLocation)) {
            throw new Error("Please create a config.yml");
        }
        const fileContents = fs.readFileSync(
            Config._configLocation,
            "utf-8"
        );
        const casted = load(fileContents) as Config;

        return casted;
    }

    /**
   *  Safe the config to the congfig.yml default location
   */
    public static saveConfig(): void {
        fs.writeFileSync(Config._configLocation, dump(CONFIG));
    }
}
