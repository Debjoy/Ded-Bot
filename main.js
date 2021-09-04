require("dotenv").config();
const { Client, Intents, Collection, WebhookClient } = require("discord.js-12");
const Database = require("better-sqlite3");
const db = new Database("dedbot.db", { verbose: console.log });

require("./globals/init");

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
  fetchAllMembers: true,
});

const fs = require("fs");
require("./globals/player_data");
const constants = require("./globals/constants");
const player_func = require("./globals/player_fun");
const utility = require("./globals/utilities");
const prefix = constants.PREFIX;

client.commands = new Collection();

const commandFiles = fs
  .readdirSync("./commands/")
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  client.commands.set(command.name, command);
}

client.once("ready", () => {
  console.log("Ded-Bot is online!");

  utility.createCommands(client);
  let players = db.prepare("Select * from running_players").all();
  console.log(players);

  players.forEach(async (player) => {
    const channel = client.channels.cache.get(player.channel_id);
    if (channel) {
      channel.messages
        .fetch(player.player_msg_id)
        .then((msg) => {
          msg.delete();
        })
        .catch((e) => console.log("message not found error"))
        .finally(() => {
          db.prepare("delete from running_players where r_player_id = $id").run(
            {
              id: player.r_player_id,
            }
          );
        });
    }
  });
});

client.ws.on("INTERACTION_CREATE", async (interaction) => {
  // do stuff and respond here
  console.log(interaction);
  const command = interaction.data.name.toLowerCase();

  if (command === "play") {
    client.commands.get("play").execute(client, interaction.data.options, null, interaction);
  }
});

client.on("message", (message) => {
  readMessage(message);
});

const readMessage = (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "test") {
    client.commands.get("test").execute(message, args);
  }

  if (command === "play" || command === "p") {
    client.commands.get("play").execute(client, args, message, null);
  }

  if (command === "leave" || command === "dc" || command === "stop") {
    client.commands.get("leave").execute(message, args);
  }

  if (command === "pause") {
    client.commands.get("pause").execute(message, args);
  }

  if (command === "resume") {
    client.commands.get("resume").execute(message, args);
  }

  if (command === "player") {
    client.commands.get("player").execute(message, args);
  }
};

client.on("messageReactionAdd", async (reaction, user) => {
  const serverQueue = playerQueue.get(reaction.message.guild.id);

  if (reaction._emoji.name == constants.EMOJI_RERUN) {
    const channel = client.channels.cache.get(reaction.message.channel.id);
    if (channel) {
      channel.messages
        .fetch(reaction.message.id)
        .then((msg) => {
          readMessage(msg);
        })
        .catch((e) => console.log("message not found error"));
    }
    return;
  }

  const member = reaction.message.guild.members.cache.get(user.id);
  const voiceChannel = member.voice.channel;
  if (
    !voiceChannel ||
    !serverQueue ||
    serverQueue.voiceChannel.id != voiceChannel.id
  )
    return;
  if (!user.bot && reaction.message.id == serverQueue.player_message.id)
    switch (reaction._emoji.name) {
      case constants.EMOJI_RESUME:
        player_func.resume(reaction.message, true);
        break;
      case constants.EMOJI_PAUSE:
        player_func.pause(reaction.message, true);
        break;
      case constants.EMOJI_STOP:
        player_func.stop(reaction.message);
        break;
    }
});
client.login(process.env.BOT_TOKEN);
