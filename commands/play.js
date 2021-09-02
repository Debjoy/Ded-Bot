const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const constants = require("../globals/constants");
const player_func = require("../globals/player_fun");
const Database = require("better-sqlite3");
const db = new Database("dedbot.db", { verbose: console.log });

module.exports = {
  name: "play",
  description: "Joins and plays a video from youtube",
  async execute(message, args) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send(
        "You need to be in a channel to execute this command!"
      );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT"))
      return message.channel.send("You dont have the correct permissins");
    if (!permissions.has("SPEAK"))
      return message.channel.send("You dont have the correct permissins");
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

    const serverQueue = playerQueue.get(message.guild.id);
    let player_message_init;
    
    if(!serverQueue){
      player_message_init = await message.channel.send(`Getting info ... ${constants.EMOJI_LOADING}`) ; 
      db.prepare("insert into running_players (player_msg_id, channel_id) values ($msg_id, $chnl_id)").run({
        chnl_id: message.channel.id,
        msg_id: player_message_init.id
      })
    }

    const connection = await voiceChannel.join();

    const song = {};

    if (validURL(args[0])) {
      //WHEN URL IS USED
      //TO be tested
      const songInfo = await ytdl.getInfo(args[0]);
      song.title = songInfo.videoDetails.title;
      song.url = songInfo.videoDetails.video_url;
      let thumbnails = songInfo.videoDetails.thumbnails;
      song.thumb = thumbnails[thumbnails.length - 1].url;
      song.isLive = songInfo.videoDetails.isLive;
    } else {
      const videoFinder = async (query) => {
        const videoResult = await ytSearch(query);
        return videoResult.videos.length > 1 ? videoResult.videos[0] : null;
      };

      const video = await videoFinder(args.join(" "));
      song.title = video.title;
      song.url = video.url;
      song.thumb = video.thumbnail;
    }
    
    if (!serverQueue) {
    
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: connection,
        player_message: player_message_init,
        player_loaded: false,
        dispatcher: null,
        songs: [],
        volume: 5,
        playing: true,
      };

      playerQueue.set(message.guild.id, queueContruct);

      queueContruct.songs.push(song); //ADDING to QUEUE
      
      message.react(constants.EMOJI_RERUN);
      player_func.play(message, queueContruct.songs[0]);
    } else {
      serverQueue.songs.push(song);
      player_func.skip(message);
      message.react("👍");
      message.react(constants.EMOJI_RERUN);
      return; //To be thought later
      serverQueue.songs.push(song);
      message.channel.send(`${song.title} has been added to the queue!`);
    }
  },
};
