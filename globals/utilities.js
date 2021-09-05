require("dotenv").config();
const { Client } = require("discord.js-12");

const getReference = (client) => {
  return process.env.MODE
    ? client.api.applications(client.user.id).guilds(process.env.DEV_GUILD_ID)
    : client.api.applications(client.user.id);
};

/* CREATING COMMANDS */

const createCommands = (client) => {
  getReference(client).commands.post({
    data: {
      name: "play",
      description: "play a song!",
      options: [
        {
          name: "song",
          description: "Enter URL or Search",
          type: 3,
          required: true,
        },
      ],
    },
  });
};

/* FETCHING COMMANDS*/

const fetchCommands = async (client) => {
  try {
    let commands = await getReference(client).commands.get();
    console.log(commands);
  } catch (e) {
    console.log("error");
  }
};

/* SENDING BACK REPLY */

const send_reply = async (
  content,
  client,
  message = null,
  interaction = null,
  private = false
) => {
  if (message) {
    if (typeof content == "object") {
      message.channel.send({ embed: content });
    } else {
      message.channel.send(content);
    }
  } else if (interaction) {
    const flag = private? 64: 0;
    if (typeof content == "object") {
      client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
          type: 4,
          data: {
            embeds: [content],
            flags: flag,
          },
        },
      });
    } else {
      client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
          type: 4,
          data: {
            content: content,
            flags: flag,
          },
        },
      });
    }
  } else {
    console.error("not enought argument!");
  }
};

/* Function to accound for slash commands */

const getVoiceChannel = (client, message, interaction) => {
  if (message) {
    return message.member.voice.channel;
  } else {
    return client.guilds.cache
      .get(interaction.guild_id)
      .members.cache.get(interaction.member.user.id).voice.channel;
  }
};
const getUser = (client, message, interaction) => {
  if (message) {
    return message.client.user;
  } else {
    return client.user;
  }
};
const getTextChannel = (client, message, interaction) => {
  if (message) {
    return message.channel;
  } else {
    return client.channels.cache.get(interaction.channel_id);
  }
};
module.exports = {
  createCommands,
  fetchCommands,
  send_reply,
  getVoiceChannel,
  getUser,
  getTextChannel,
};
