const player_func = require("../globals/player_fun");
const constants = require("../globals/constants");
const utility = require("../globals/utilities");
module.exports = {
  name: "help",
  description: "this is a help command!",
  execute(client, args, message, interaction) {
    const prefix = constants.PREFIX;
    const help_embed = {
      color: constants.COLOR_INFO,
      fields: [
        {
          name: `${prefix}play or /play`,
          value: `Play song with youtube url or search
                    **Alias**: \`${prefix}p\`
                    **Syntax.** \`${prefix}play <song/youtube url>\``,
        },
        {
          name: `${prefix}pause`,
          value: `Pause currently playing song.`,
        },
        {
          name: `${prefix}resume`,
          value: `Resumes currently paused song.`,
        },
        {
          name: `${prefix}stop`,
          value: `Stops currently playing song and leaves.
                    **Alias**: \`${prefix}dc\` , \`${prefix}leave\` , \`${prefix}disconnect\``,
        },
        {
          name: `${prefix}skip or /skip`,
          value: `Skips currently playing song.`,
        },
        {
          name: `${prefix}player`,
          value: `Re-Renders the player for easy access.`,
        },
        {
          name: `${prefix}help or /help`,
          value: `Bruh.`,
        },
      ],
    };
    utility.send_reply(help_embed, client, message, interaction, false);
  },
};
