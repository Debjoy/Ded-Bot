const player_func = require("../globals/player_fun");
const constants = require("../globals/constants");
const utility = require("../globals/utilities");

module.exports = {
    name: 'ping',
    description: "this is a ping command!",
    execute(client, args, message, interaction){
        if(interaction)return;
        utility.send_reply({
            title: "Pong 🏓",
            color: constants.COLOR_WARNING,
            description: `⏳ Latency : \`${ message.createdTimestamp - Date.now()} ms.\`
            🚀 API Latency : \`${Math.round(client.ws.ping)} ms\``
          }, client, message, null, false);
    }
}