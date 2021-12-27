require('dotenv').config();
const fs = require('fs');

const getReference = (client) => {
  return process.env.MODE
    ? client.api.applications(client.user.id).guilds(process.env.DEV_GUILD_ID)
    : client.api.applications(client.user.id);
};

/* CREATING COMMANDS */

const createCommands = (client) => {
  getReference(client).commands.post({
    data: {
      name: 'play',
      description: 'play a song! 🎶',
      options: [
        {
          name: 'song',
          description: 'Enter URL or Search',
          type: 3,
          required: true,
        },
      ],
    },
  });
  getReference(client).commands.post({
    data: {
      name: 'help',
      description: 'Need help? 🖐',
    },
  });
  getReference(client).commands.post({
    data: {
      name: 'skip',
      description: 'Skip the current song! ⏭',
    },
  });
  getReference(client).commands.post({
    data: {
      name: 'loop',
      description: 'Toggles repeat mode! 🔁',
    },
  });
  getReference(client).commands.post({
    data: {
      name: 'activity',
      description: 'Starts a new activity',
      options: [
        {
          name: 'channel',
          description: 'Enter a Voice Channel name',
          type: 7,
          required: true,
          channel_types: [2],
        },
        {
          name: 'activity',
          description: 'name of activity you want to play',
          required: true,
          type: 3,
          choices: [
            {
              name: 'Watch Together',
              value: '880218394199220334',
            },
            {
              name: 'Doodle Crew',
              value: '878067389634314250',
            },
            {
              name: 'Poker Night',
              value: '755827207812677713',
            },
            {
              name: 'Betrayal.io',
              value: '773336526917861400',
            },
            {
              name: 'Flashington.io',
              value: '814288819477020702',
            },
            {
              name: 'Chess in The Park',
              value: '832012774040141894',
            },
            {
              name: 'Checkers in The Park',
              value: '832013003968348200',
            },
            {
              name: 'Letter Tile',
              value: '879863686565621790',
            },
            {
              name: 'Word Snacks',
              value: '879863976006127627',
            },
            {
              name: 'SpellCast',
              value: '852509694341283871',
            },
          ],
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
    console.log('error');
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
    if (typeof content == 'object') {
      message.channel.send({ embed: content });
    } else {
      message.channel.send(content);
    }
  } else if (interaction) {
    const flag = private ? 64 : 0;
    if (typeof content == 'object') {
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
    console.error('not enought argument!');
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
    console.log('inside');
    let description = message.embeds[0].description;
    if (
      description.toLowerCase().startsWith('groovy is no longer in service.')
    ) {
      const groovy_msgs = JSON.parse(
        fs.readFileSync('./globals/groovy_miss.json', 'utf8')
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
