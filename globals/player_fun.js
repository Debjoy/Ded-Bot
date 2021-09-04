const ytdl = require("ytdl-core");
const constants = require("../globals/constants");
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
      serverQueue.songs.shift();
      play(message, interaction, serverQueue.songs[0]);
    })
    .on("error", (error) => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.dispatcher = dispatcher;

  if (!serverQueue.player_loaded) {
    const player_embed = {
      title: `Player: Running ▶`,
      color: constants.COLOR_SUCCESS,
      description: `:thumbsup: Now Playing ***${song.title}***`,
      thumbnail: {
        url: song.thumb,
      },
      footer: {
        text: `Use ${constants.PREFIX}player to bring the player again`,
      },
    };
    serverQueue.player_message.edit({ content: null, embed: player_embed });
    await serverQueue.player_message.react(constants.EMOJI_STOP);
    serverQueue.player_message.react(constants.EMOJI_PAUSE);
    serverQueue.player_loaded = true;
  } else {
    const player_embed = {
      title: `Player: Playing ▶`,
      color: constants.COLOR_SUCCESS,
      description: `:thumbsup: Now Playing ***${song.title}***`,
      thumbnail: {
        url: song.thumb,
      },
      footer: {
        text: `Use ${constants.PREFIX}player to bring the player again`,
      },
    };
    serverQueue.player_message.edit({ embed: player_embed });
  }
};

const pause = (message, isReaction = false) => {
  const serverQueue = playerQueue.get(message.guild.id);

  if (serverQueue.playing) {
    if (serverQueue.dispatcher) {
      serverQueue.dispatcher.pause(true);
      if (!isReaction) message.react("👍");
      serverQueue.playing = false;
      const song = serverQueue.songs[0];
      const player_embed = {
        title: `Player: Paused ⏸`,
        color: constants.COLOR_INFO,
        description: `:thumbsup: Now Paused ***${song.title}***`,
        thumbnail: {
          url: song.thumb,
        },
        footer: {
          text: `Use ${constants.PREFIX}player to bring the player again`,
        },
      };
      serverQueue.player_message.edit({ embed: player_embed });
      serverQueue.player_message.reactions.cache
        .get(constants.EMOJI_PAUSE)
        ?.remove()
        .catch((error) => console.error("Failed to remove reactions:", error));
      serverQueue.player_message.react(constants.EMOJI_RESUME);
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
      const song = serverQueue.songs[0];
      const player_embed = {
        title: `Player: Playing ▶`,
        color: constants.COLOR_SUCCESS,
        description: `:thumbsup: Now Playing ***${song.title}***`,
        thumbnail: {
          url: song.thumb,
        },
        footer: {
          text: `Use ${constants.PREFIX}player to bring the player again`,
        },
      };
      serverQueue.player_message.edit({ embed: player_embed });
      serverQueue.player_message.reactions.cache
        .get(constants.EMOJI_RESUME)
        ?.remove()
        .catch((error) => console.error("Failed to remove reactions:", error));
      serverQueue.player_message.react(constants.EMOJI_PAUSE);
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
  playerQueue.delete(message.guild.id);
};

const skip = (message, interaction) => {
  const serverQueue = playerQueue.get(
    message ? message.guild.id : interaction.guild_id
  );
  if (!serverQueue) return;
  serverQueue.connection.dispatcher.end();
};
module.exports = {
  play,
  pause,
  resume,
  stop,
  skip,
};
