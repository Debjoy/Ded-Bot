require("dotenv").config();
const fs = require("fs");

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
      description: "play a song! 🎶",
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
  getReference(client).commands.post({
    data: {
      name: "help",
      description: "Need help? 🖐",
    },
  });
  getReference(client).commands.post({
    data: {
      name: "skip",
      description: "Skip the current song! ⏭",
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
    const flag = private ? 64 : 0;
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

const checkGroovy = (message) => {  
  if (
    message.author.bot &&
    message.author.id === `234395307759108106` &&
    message.embeds.length > 0
  ) {
    console.log("inside")
    let description = message.embeds[0].description;
    if (description.toLowerCase().startsWith("groovy is no longer in service.")) {
      const groovy_msgs = JSON.parse(
        fs.readFileSync("./globals/groovy_miss.json", "utf8")
      );
      let random_number = Math.floor(Math.random() * groovy_msgs.length);
      console.log(random_number);
      let msg = groovy_msgs[random_number];
      message.channel.send(msg);

      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};
module.exports = {
  createCommands,
  fetchCommands,
  send_reply,
  getVoiceChannel,
  getUser,
  getTextChannel,
  checkGroovy,
};
