const player_func = require("../globals/player_fun");
const Database = require("better-sqlite3");
const db = new Database("dedbot.db", { verbose: console.log });
const constants = require("../globals/constants");

module.exports = {
  name: "player",
  description: "Re-renders the player",
  async execute(message, args) {
    const voiceChannel = message.member.voice.channel;
    const serverQueue = playerQueue.get(message.guild.id);
    if (!serverQueue) {
      return message.channel.send("Nothing's playing 😶 !");
    }
    if (!voiceChannel || serverQueue.voiceChannel.id != voiceChannel.id)
      return message.channel.send(
        "You need to be in the same voice channel to pause the music!"
      );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT"))
      return message.channel.send("You dont have the correct permissins");
    if (!permissions.has("SPEAK"))
      return message.channel.send("You dont have the correct permissins");

    const message_contents = serverQueue.player_message.embeds[0];
    message.channel.send({ embed: message_contents }).then(async (msg) => {
      serverQueue.player_message.reactions.cache.map((emoji) => {
          msg.react(emoji._emoji.name);
      });
      serverQueue.player_message.edit(`Player moved ✅`);
      db.prepare("delete from running_players where player_msg_id = $msg_id").run({
        msg_id: serverQueue.player_message.id,
      });
      serverQueue.player_message.reactions
        .removeAll()
        .catch((error) => console.error("Failed to clear reactions:", error));
      
      serverQueue.player_message = msg;
      serverQueue.textChannel = message.channel;
      db.prepare("insert into running_players (player_msg_id, channel_id) values ($msg_id, $chnl_id)").run({
        chnl_id: serverQueue.textChannel.id,
        msg_id: serverQueue.player_message.id
      })
      await serverQueue.player_message.react(constants.EMOJI_STOP);
      serverQueue.player_message.react(constants.EMOJI_PAUSE);
    });
  },
};
