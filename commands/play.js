const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const constants = require("../globals/constants");
const utility = require("../globals/utilities");
const player_func = require("../globals/player_fun");
const Database = require("better-sqlite3");
const URL = require("url");
const db = new Database("dedbot.db", { verbose: console.log });

module.exports = {
  name: "play",
  description: "Joins and plays a video from youtube",
  async execute(client, args, message, interaction) {
    const voiceChannel = utility.getVoiceChannel(client, message, interaction);
    if (!voiceChannel)
      return utility.send_reply(
        "You need to be in a channel to execute this command!",
        client,
        message,
        interaction,
        true
      );
    const permissions = voiceChannel.permissionsFor(
      utility.getUser(client, message, interaction)
    );
    if (!permissions.has("CONNECT"))
      return utility.send_reply(
        "You dont have the correct permissins",
        client,
        message,
        interaction,
        true
      );
    if (!permissions.has("SPEAK"))
      return utility.send_reply(
        "You dont have the correct permissions",
        client,
        message,
        interaction,
        true
      );
    if (!args.length)
      return message.channel.send("You need to send the second argument!");

    const validURL = (str) => {
      var regex =
        /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
      if (!regex.test(str)) {
        return false;
      } else {
        return true;
      }
    };

    const input = typeof args[0] == "object" ? args[0].value : args.join(" ");
    if (validURL(input)) {
      const query = URL.parse(input, true);
      if (
        query.host != "www.youtube.com" &&
        query.host != "youtu.be" &&
        query.host != "youtube.com"
      ) {
        return utility.send_reply(
          "Please add a valid youtube url",
          client,
          message,
          interaction,
          true
        );
      }
    }
    const serverQueue = playerQueue.get(
      message ? message.guild.id : interaction.guild_id
    );
    let player_message_init;

    if (!serverQueue) {
      if (interaction)
        utility.send_reply("Player 👇", client, message, interaction);
      player_message_init = await utility
        .getTextChannel(client, message, interaction)
        .send(`Preparing ${constants.EMOJI_LOADING}`);
      db.prepare(
        "insert into running_players (player_msg_id, channel_id) values ($msg_id, $chnl_id)"
      ).run({
        chnl_id: utility.getTextChannel(client, message, interaction).id,
        msg_id: player_message_init.id,
      });
    }

    const connection = await voiceChannel.join();
    connection.voice.setDeaf(true);
    const song = {};
    const songList = [];
    if (validURL(input)) {
      //WHEN URL IS USED
      const query = URL.parse(input, true);
      if (player_message_init)
        player_message_init.edit(`Searching 🔍 ${constants.EMOJI_LOADING}`);
      if (query.query && query.query.list) {
        const list = await ytSearch({ listId: query.query.list });
        if (player_message_init)
          player_message_init.edit(
            `Loading ${list.size} tracks 💿, ${constants.EMOJI_LOADING}`
          );
        songList.push(
          ...list.videos.map((song) => ({
            title: song.title,
            url: `https://www.youtube.com/watch?v=${song.videoId}`,
            thumb: song.thumbnail,
          }))
        );
      } else {
        const songInfo = await ytdl.getInfo(input);
        let thumbnails = songInfo.videoDetails.thumbnails;

        songList.push({
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          thumb: thumbnails[thumbnails.length - 1].url,
          isLive: songInfo.videoDetails.isLive,
        });
      }
    } else {
      if (player_message_init)
        player_message_init.edit(`Searching 🔍 ${constants.EMOJI_LOADING}`);
      const videoFinder = async (query) => {
        const videoResult = await ytSearch(query);
        return videoResult.videos.length > 1 ? videoResult.videos[0] : null;
      };

      const video = await videoFinder(input);
      songList.push({
        title: video.title,
        url: video.url,
        thumb: video.thumbnail,
      });
    }

    if (!serverQueue) {
      const queueContruct = {
        textChannel: utility.getTextChannel(client, message, interaction),
        voiceChannel: voiceChannel,
        connection: connection,
        player_message: player_message_init,
        player_loaded: false,
        dispatcher: null,
        songs: [],
        volume: 5,
        playing: true,
        isLooping: false,
      };

      playerQueue.set(
        message ? message.guild.id : interaction.guild_id,
        queueContruct
      );

      queueContruct.songs.push(...songList); //ADDING to QUEUE

      if (message) message.react(constants.EMOJI_RERUN);
      player_func.play(message, interaction, queueContruct.songs[0]);
    } else {
      serverQueue.songs.push(...songList);

      message ? message.react("👍") : null;

      if (songList.length > 1) {
        utility.send_reply(
          `**${songList.length} tracks 💿** has been added to the queue!`,
          client,
          message,
          interaction
        );
      } else {
        utility.send_reply(
          `**${songList[0].title}** has been added to the queue!`,
          client,
          message,
          interaction
        );
      }

      player_func.updatePlayer(serverQueue);
    }
  },
};
