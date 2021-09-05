require("dotenv").config();
module.exports = {
  PREFIX: process.env.BOT_PREFIX,

  COLOR_SUCCESS: 3066993,
  COLOR_WARNING: 15844367,
  COLOR_DANGER: 15158332,
  COLOR_INFO: 3447003,

  EMOJI_RESUME: "▶",
  EMOJI_PAUSE: "⏸",
  EMOJI_STOP: "🟥",
  EMOJI_SKIP: "⏭",
  EMOJI_RERUN: "⏯️",
  EMOJI_LOADING:"<a:loading:882834955292540958>" // custom animated emoji for loading animation
};
