const player_func = require("../globals/player_fun");

module.exports = {
  name: "pause",
  description: "pause the bot",
  async execute(message, args) {
    const voiceChannel = message.member.voice.channel;
    const serverQueue = playerQueue.get(message.guild.id);
    if(!serverQueue){
        return message.channel.send(
            "Nothing's playing 😶 !"
          );
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

    player_func.pause(message);
  },
};
