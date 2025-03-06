-- db-shemas/shema.sql

-- Create Players table.
CREATE TABLE IF NOT EXISTS Players (
  id INTEGER PRIMARY KEY,
  discord_id TEXT NOT NULL UNIQUE,
  steam_id TEXT,
  name TEXT,
  mmr INTEGER,
  captain INTEGER DEFAULT 0
);

-- Create Game table.
CREATE TABLE IF NOT EXISTS Game (
  id INTEGER PRIMARY KEY,
  status TEXT,
  result INTEGER,
  steam_match_id INTEGER,
  type TEXT,
  game_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  game_started_at TIMESTAMP
);

-- Create GamePlayers table.
CREATE TABLE IF NOT EXISTS GamePlayers (
  id INTEGER PRIMARY KEY,
  game_id INTEGER,
  player_id INTEGER,
  team INTEGER,
  arrived INTEGER DEFAULT 0,
  FOREIGN KEY(game_id) REFERENCES Game(id),
  FOREIGN KEY(player_id) REFERENCES Players(id)
);

-- Create GameArgs table.
CREATE TABLE IF NOT EXISTS GameArgs (
  id INTEGER PRIMARY KEY,
  game_id INTEGER,
  lobby_name TEXT,
  lobby_password TEXT,
  FOREIGN KEY(game_id) REFERENCES Game(id)
);

-- Create SteamBots table.
CREATE TABLE IF NOT EXISTS SteamBots (
  id INTEGER PRIMARY KEY,
  username TEXT,
  password TEXT,
  status INTEGER
);

-- Create PlayerRoles table.
CREATE TABLE IF NOT EXISTS PlayerRoles (
  id INTEGER PRIMARY KEY,
  player_id INTEGER,
  role INTEGER,
  FOREIGN KEY(player_id) REFERENCES Players(id)
);
