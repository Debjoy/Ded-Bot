require('dotenv').config();
const utility = require('../globals/utilities');
const {
  InteractionResponseType,
  InviteTargetType,
  RouteBases,
  Routes,
} = require('discord-api-types/v9');
const fetch = require('node-fetch');

module.exports = {
  name: 'activity',
  description: 'Unlocks an activity in discord.',
  async execute(client, args, message, interaction) {
    const r = await fetch(
      `${RouteBases.api}${Routes.channelInvites(
        interaction.data.options[0].value
      )}`,
      {
        method: 'POST',
        headers: {
          authorization: `Bot ${process.env.BOT_TOKEN}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          max_age: 0,
          target_type: InviteTargetType.EmbeddedApplication,
          target_application_id: interaction.data.options[1].value,
        }),
      }
    );

    const invite = await r.json();

    if (r.status !== 200) {
      return respond({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: `An error occured: ${invite.message}\nMake sure I have the "Create Invite" permission in the voice channel!`,
          allowed_mentions: { parse: [] },
        },
      });
    }
    utility.send_reply(
      `[Click to open ${invite.target_application.name} in ${invite.channel.name}](<https://discord.gg/${invite.code}>)`,
      client,
      message,
      interaction,
      false
    );
  },
};
