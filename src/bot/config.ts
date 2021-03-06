import { safeDump, safeLoad } from "js-yaml";
import fs from "fs";

/**
 * This represents the config.yml
 * @class Config
 * @property {string} giphyAPI
 * @property {string[]} owners
 * @property {string} prefix
 * @property {string} token
 * @property {string} topGGKey
 * @property {string[]} workStrings
 * @property {string} xRapidapiKey
 * @property {string} youtubeApiKey
 */
export default class Config {
    private static readonly _configLocation = "./config.yml";

    public readonly giphyAPI: string;

    public readonly owners: string[];

    public readonly prefix: string;

    public readonly token: string;

    public readonly topGGKey: string;

    public readonly workStrings: string[];

    public readonly xRapidapiKey: string;

    public readonly youtubeApiKey: string;


    private constructor() {
        this.giphyAPI = "";
        this.owners = [""];
        this.prefix = "";
        this.token = "";
        this.topGGKey = "";
        this.workStrings = [""];
        this.xRapidapiKey = "";
        this.youtubeApiKey = "";
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
        const casted = safeLoad(fileContents) as Config;

        return casted;
    }

    /**
   *  Safe the config to the congfig.yml default location
   */
    public saveConfig(): void {
        const serialized = safeDump(this);
        fs.writeFileSync(
            Config._configLocation,
            serialized,
            "utf8"
        );
    }
}
