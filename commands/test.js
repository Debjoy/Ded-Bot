const player_func = require("../globals/player_fun");
module.exports = {
    name: 'test',
    description: "this is a ping command!",
    execute(message, args){
        message.channel.send('check console!');
    }
}