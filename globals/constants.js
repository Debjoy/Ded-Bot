require("dotenv").config();
module.exports = {
  PREFIX: process.env.BOT_PREFIX,

  COLOR_SUCCESS: `#47ff94`,
  COLOR_WARNING: `#ffd445`,
  COLOR_DANGER: `#fa4d43`,
  COLOR_INFO: `#4396fa`,

  EMOJI_RESUME: "▶",
  EMOJI_PAUSE: "⏸",
  EMOJI_STOP: "❌",
  EMOJI_RERUN: "⏯️",
  EMOJI_LOADING:"<a:loading:882834955292540958>" // custom animated emoji for loading animation
};
