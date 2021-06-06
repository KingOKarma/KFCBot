import * as commando from "discord.js-commando";
import { CONFIG, globalEmotes, musicQueue } from "../../bot/globals";
import { Message, MessageEmbed } from "discord.js";
import { Queue } from "../../types/musicTypes";
import axios from "axios";
import { playSong } from "../../bot/utils";
import ytdl from "ytdl-core";

// Creates a new class (being the command) extending off of the commando client
export default class PlayCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            // Creates aliases
            aliases: ["p"],
            // These are your arguments
            args: [
                {
                    key: "q",
                    prompt: "What song do you want to hear",
                    type: "string"
                }
            ],
            description: "Play music now or add it to the queue",
            group: "music",
            guildOnly: true,
            memberName: "play",
            name: "play",
            throttling: {
                duration: 5,
                usages: 3
            }
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { q }: { q: string; }
    ): Promise<Message | Message[]> {
        if (msg.member === null)
            return msg.say("Couldn't get user. if you keep experiencing this please contact a developer");
        if (msg.guild === null)
            return msg.say("This is an guild only command");
        if (msg.guild.me === null)
            return msg.say("Couldnt find myself XD. please try again");

        // Get users vc and the queue
        const userVc = msg.member.voice.channel;
        const queue = musicQueue.get(msg.guild.id);

        // Checking if we can join the users vc and if we are already playing in another vc
        if (!userVc)
            return msg.say("You have to be in a voice channel");
        // Permission checking
        if (!userVc.speakable)
            return msg.say("Missing the permission to talk in your vc");
        if (!userVc.joinable)
            return msg.say("Missing the permission to join your vc");

        if (queue && userVc !== msg.guild.me.voice.channel)
            return msg.say("Im already playing in another vc");
        // Fetch the song/video data from the youtube api
        const { data: fetchedSong } = await axios.get("https://www.googleapis.com/youtube/v3/search", {
            params: {
                key: CONFIG.youtubeApiKey,
                maxResults: 1,
                part: "id,snippet",
                q,
                type: "video"
            }
        });
        // eslint-disable-next-line @typescript-eslint/naming-convention
        if (fetchedSong === undefined)
            return msg.say("Could not find any songs with that name/link");

        // Get all the details of the song/video
        const { videoDetails: song } = await ytdl.getInfo(`https://www.youtube.com/watch?v=${fetchedSong.items[0].id.videoId}`);

        // Checks if the song is livestreamed
        if (song.isLiveContent)
            return msg.say("Sorry but I cant play live content");

        let thumbnail = song.thumbnails[0].url;
        if (thumbnail.includes("hqdefault.jpg")) {
            const replace = new RegExp("hqdefault.jpg");
            thumbnail = thumbnail.replace(replace, "maxresdefault.jpg");
        }

        let channelAuthor = song.ownerChannelName;
        if (song.author.verified) channelAuthor = `${song.ownerChannelName} ${globalEmotes.verifiedEmote}`;
        let avatar = "https://thumbs.dreamstime.com/b/web-189206689.jpg";
        // eslint-disable-next-line prefer-destructuring
        if (song.author.thumbnails !== undefined) avatar = song.author.thumbnails[2].url;
        // If there is no queue create one and play the song. if there is an queue add the song to the queue
        if (!queue) {
            const conn = await userVc.join();
            const newQueue: Queue = {
                at: 0,
                connection: conn,
                length: Number(song.lengthSeconds),
                looping: false,
                msg,
                playing: false,
                songs: [{
                    authorAvatar: avatar,
                    authorName: channelAuthor,
                    authorVerified: song.author.verified,
                    id: song.videoId,
                    lengthSeconds: song.lengthSeconds,
                    thumbnail,
                    title: song.title,
                    url: song.video_url
                }],
                totalSongs: 1
            };
            musicQueue.set(msg.guild.id, newQueue);
            void playSong(msg, song.video_url);
            return msg;
        }
        queue.songs.push({
            authorAvatar: avatar,
            authorName: channelAuthor,
            authorVerified: song.author.verified,
            id: song.videoId,
            lengthSeconds: song.lengthSeconds,
            thumbnail,
            title: song.title,
            url: song.video_url
        });
        const conn = await userVc.join();

        queue.length += Number(song.lengthSeconds);
        queue.totalSongs += 1;
        queue.connection = conn;
        musicQueue.set(msg.guild.id, queue);

        const embed = new MessageEmbed()
            .setThumbnail(avatar)
            .setTitle(`Queued - ${channelAuthor}`)
            .setDescription(`**[${song.title}](${song.video_url})**`)
            .setColor(msg.guild.me.displayColor)
            .setImage(thumbnail);

        return msg.say(embed);
    }
}


