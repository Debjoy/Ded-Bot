const player_func = require("../globals/player_fun");
const constants = require("../globals/constants");
const utility = require("../globals/utilities");

module.exports = {
  name: "skip",
  description: "skips the currently playing song.",
  async execute(client, args, message, interaction) {
    const voiceChannel = utility.getVoiceChannel(client, message, interaction);

    const serverQueue = playerQueue.get(
      message ? message.guild.id : interaction.guild_id
    );
    if (!serverQueue) {
      return utility.send_reply(
        "Nothing's playing 😶 !",
        client,
        message,
        interaction
      );
    }
    if (!voiceChannel || serverQueue.voiceChannel.id != voiceChannel.id)
      return utility.send_reply(
        "You need to be in the same voice channel to stop the music!",
        client,
        message,
        interaction
      );

    const permissions = voiceChannel.permissionsFor(
      utility.getUser(client, message, interaction)
    );
    if (!permissions.has("CONNECT"))
      return utility.send_reply(
        "You dont have the correct permissions",
        client,
        message,
        interaction
      );
    if (!permissions.has("SPEAK"))
      return utility.send_reply(
        "You dont have the correct permissions",
        client,
        message,
        interaction
      );
    if (message) message.react("👍");
    else utility.send_reply("Skipping 👍", client, null, interaction);
    player_func.skip(message, interaction);
  },
};
