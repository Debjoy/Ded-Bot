const ytdl = require("ytdl-core");
const constants = require("../globals/constants");
const utility = require("../globals/utilities");
const Database = require("better-sqlite3");
const db = new Database("dedbot.db", { verbose: console.log });

const play = async (message, interaction, song) => {
  const serverQueue = playerQueue.get(
    message ? message.guild.id : interaction.guild_id
  );
  if (!song) {
    stop(message, interaction);
    return;
  }
  let filters = {};
  if (!song.isLive) filters.filter = "audioonly";
  const dispatcher = serverQueue.connection
    .play(ytdl(song.url, filters))
    .on("finish", () => {
      if (!serverQueue.isLooping) serverQueue.songs.shift();
      play(message, interaction, serverQueue.songs[0]);
    })
    .on("error", (error) => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.dispatcher = dispatcher;

  updatePlayer(serverQueue);
  serverQueue.player_loaded = true;
};

const pause = (message, isReaction = false) => {
  const serverQueue = playerQueue.get(message.guild.id);

  if (serverQueue.playing) {
    if (serverQueue.dispatcher) {
      serverQueue.dispatcher.pause(true);
      if (!isReaction) message.react("👍");
      serverQueue.playing = false;
      const song = serverQueue.songs[0];
      updatePlayer(serverQueue);
    } else {
      message.react("⚠");
    }
  } else if (!isReaction) message.react("🙄");
  else console.log("Already paused");
};

const resume = (message, isReaction = false) => {
  const serverQueue = playerQueue.get(message.guild.id);

  if (!serverQueue.playing) {
    if (serverQueue.dispatcher) {
      serverQueue.dispatcher.resume();

      if (!isReaction) message.react("👍");
      serverQueue.playing = true;

      updatePlayer(serverQueue);
    } else {
      message.react("⚠");
    }
  } else if (!isReaction) message.react("🙄");
  else console.log("Already playing");
};

const stop = async (message, interaction) => {
  const serverQueue = playerQueue.get(
    message ? message.guild.id : interaction.guild_id
  );

  await serverQueue.voiceChannel.leave();
  serverQueue.player_message.edit(`Player closed 👍. Have a nice day!`);
  serverQueue.player_message.reactions
    .removeAll()
    .catch((error) => console.error("Failed to clear reactions:", error));
  db.prepare("delete from running_players where player_msg_id = $msg_id").run({
    msg_id: serverQueue.player_message.id,
  });
  playerQueue.delete(message ? message.guild.id : interaction.guild_id);
};

const skip = (message, interaction) => {
  const serverQueue = playerQueue.get(
    message ? message.guild.id : interaction.guild_id
  );
  if (!serverQueue || !serverQueue.connection.dispatcher) return;
  stopLoop(message, interaction);
  serverQueue.connection.dispatcher.end();
};
const loop = (message, interaction) => {
  const serverQueue = playerQueue.get(
    message ? message.guild.id : interaction.guild_id
  );
  if (!serverQueue) return;
  serverQueue.isLooping = !serverQueue.isLooping;
  updatePlayer(serverQueue);
};
const stopLoop = (message, interaction) => {
  const serverQueue = playerQueue.get(
    message ? message.guild.id : interaction.guild_id
  );
  if (!serverQueue) return;
  serverQueue.isLooping = false;
  updatePlayer(serverQueue);
};

const updatePlayer = (serverQueue) => {
  const msg = serverQueue.player_message;
  msg.react(constants.EMOJI_RESUME);
  msg.react(constants.EMOJI_PAUSE);
  msg.react(constants.EMOJI_SKIP);
  msg.react(constants.EMOJI_STOP);
  msg.react(constants.EMOJI_REPEAT);
  if (serverQueue.songs.length == 0) return console.log("Queue empty");

  let song = serverQueue.songs[0];
  let queueString = "";
  if (serverQueue.songs.length > 1) {
    serverQueue.songs.every((song, index) => {
      if (index > 0) {
        queueString += `**▫** ${song.title}\n`;
        if (index > 2) {
          queueString += `**▫** . . . . . . . . . . . . . . . . . \n**▫ ${
            serverQueue.songs.length - 1
          } songs queued.**`;
          return false;
        }
      }
      return true;
    });
  } else {
    queueString =
      "Empty! will close " +
      constants.EMOJI_STOP +
      " player when skipped " +
      constants.EMOJI_SKIP;
  }
  const player_embed = {
    title: `Player: ${serverQueue.playing ? "Playing ▶" : "Player: Paused ⏸"} ${
      serverQueue.isLooping ? "Looping 🔁" : ""
    }`,
    color: serverQueue.playing ? constants.COLOR_SUCCESS : constants.COLOR_INFO,
    description: `🎶 Now Playing ***${song.title}***`,
    thumbnail: {
      url: song.thumb,
    },
    fields: [
      {
        name: "Queue 💿",
        value: queueString,
      },
    ],
    footer: {
      text: `Use ${constants.PREFIX}player to bring the player again`,
    },
  };
  serverQueue.player_message.edit({ content: null, embed: player_embed });
};
module.exports = {
  play,
  pause,
  resume,
  stop,
  skip,
  updatePlayer,
  loop,
};
