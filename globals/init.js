const Database = require("better-sqlite3");
const db = new Database("dedbot.db", { verbose: console.log });

const old_players = db.prepare(`CREATE TABLE IF NOT EXISTS running_players
  (r_player_id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_msg_id varchar(32),
    channel_id varchar(32))`);

old_players.run();
