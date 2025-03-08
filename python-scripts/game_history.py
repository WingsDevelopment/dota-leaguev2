import json
import sqlite3
import os
from sqlite3 import Connection, Cursor
from utility import dict_factory

# Ensure the DB_PATH falls back to the same default as discord_db.py
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.getenv("DATABASE_PATH", os.path.join(BASE_DIR, "db", "league.db"))

def create_match_history(cursor: Cursor, match_id: int, league_id: int, start_time: int, duration: int,
                           game_mode: str, lobby_type: str, region: str, winner: str,
                           radiant_score: int, dire_score: int, additional_info: dict):
    query = '''
        INSERT INTO MatchHistory(match_id, league_id, start_time, duration, game_mode, lobby_type,
                                  region, winner, radiant_score, dire_score, additional_info)
        VALUES(?,?,?,?,?,?,?,?,?,?,?)
    '''
    cursor.execute(query, (match_id, league_id, start_time, duration, game_mode, lobby_type,
                           region, winner, radiant_score, dire_score, json.dumps(additional_info)))
    print(f"[MATCH_HISTORY] Inserted MatchHistory for match_id: {match_id}")

def create_match_player_stats(cursor: Cursor, match_history_id: int, steam_id: str,
                              hero_id: int, kills: int, deaths: int, assists: int,
                              net_worth: int, last_hits: int, denies: int, gpm: int,
                              xpm: int, damage: int, heal: int, building_damage: int,
                              wards_placed: int, items: list):
    query = '''
        INSERT INTO MatchPlayerStats(match_history_id, steam_id, hero_id, kills, deaths, assists,
                                      net_worth, last_hits, denies, gpm, xpm, damage, heal, building_damage,
                                      wards_placed, items)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    '''
    cursor.execute(query, (match_history_id, steam_id, hero_id, kills, deaths, assists,
                           net_worth, last_hits, denies, gpm, xpm, damage, heal, building_damage,
                           wards_placed, json.dumps(items)))
    print(f"[MATCH_HISTORY] Inserted stats for steam_id: {steam_id} (match_history_id: {match_history_id})")

def get_effective_slot(player: dict) -> int:
    """
    Computes an effective slot for a player.
    For detailed players, 'player_slot' is already present.
    For basic players, use 'team_slot' plus 128 if team_number is 1.
    """
    if "player_slot" in player:
        return player["player_slot"]
    else:
        team = player.get("team_number", 0)
        slot = player.get("team_slot", 0)
        return slot + 128 if team == 1 else slot

def merge_players_by_slot(basic_players: list, detailed_players: list) -> list:
    """
    Merge basic and detailed player data using the computed effective slot.
    Keys from the detailed player override the basic player.
    """
    basic_lookup = { get_effective_slot(p): p for p in basic_players }
    merged = []
    for d in detailed_players:
        slot = get_effective_slot(d)
        if slot in basic_lookup:
            merged_player = {**basic_lookup[slot], **d}
            merged.append(merged_player)
        else:
            merged.append(d)
    return merged

def store_match_history(match_details: dict, league_id: int, basic_players: list):
    """
    Given detailed match data (from OpenDota's match endpoint) and a basic players list,
    merge the two using effective player slots and then store the match and each player's stats.
    """
    conn: Connection = sqlite3.connect(DB_PATH)
    conn.row_factory = dict_factory
    cursor: Cursor = conn.cursor()

    # Extract match-level details.
    match_id = match_details.get("match_id")
    start_time = match_details.get("start_time")
    duration = match_details.get("duration")
    game_mode = str(match_details.get("game_mode", "Unknown"))
    lobby_type = str(match_details.get("lobby_type", "Unknown"))
    region = str(match_details.get("region", "Unknown"))
    # Decide winner: if detailed data includes "winner" use that; otherwise use radiant_win.
    if match_details.get("winner") in ["radiant", "dire"]:
        winner = match_details.get("winner")
    else:
        winner = "radiant" if match_details.get("radiant_win") else "dire"
    radiant_score = match_details.get("radiant_score", 0)
    dire_score = match_details.get("dire_score", 0)
    additional_info = {
        "replay_url": match_details.get("replay_url"),
        "picks_bans": match_details.get("picks_bans"),
        "cluster": match_details.get("cluster")
    }

    print(f"[MATCH_HISTORY] Storing match_id: {match_id} | start_time: {start_time} | duration: {duration}")
    print(f"[MATCH_HISTORY] game_mode: {game_mode}, lobby_type: {lobby_type}, region: {region}, winner: {winner}")
    print(f"[MATCH_HISTORY] radiant_score: {radiant_score}, dire_score: {dire_score}")

    # Insert match-level record.
    create_match_history(cursor, match_id, league_id, start_time, duration,
                           game_mode, lobby_type, region, winner, radiant_score,
                           dire_score, additional_info)
    match_history_id = cursor.lastrowid
    print(f"[MATCH_HISTORY] match_history_id: {match_history_id}")

    # Merge the basic players with the detailed players using effective slot.
    detailed_players = match_details.get("players", [])
    merged_players = merge_players_by_slot(basic_players, detailed_players)
    print(f"[MATCH_HISTORY] Processing {len(merged_players)} merged players...")

    for player in merged_players:
        # Get steam_id: try first from steam_account; if missing, fall back to account_id.
        steam_account = player.get("steam_account")
        if isinstance(steam_account, dict):
            steam_id = str(steam_account.get("id64", ""))
        else:
            steam_id = str(player.get("account_id", ""))
        # Get hero_id: check if a "hero" sub-dictionary exists.
        if "hero" in player and isinstance(player["hero"], dict):
            hero_id = player["hero"].get("hero_id", 0)
        else:
            hero_id = player.get("hero_id", 0)
        kills = player.get("kills", 0)
        deaths = player.get("deaths", 0)
        assists = player.get("assists", 0)
        net_worth = player.get("net_worth", 0)
        last_hits = player.get("last_hits", 0)
        denies = player.get("denies", 0)
        gpm = player.get("gold_per_min", 0)
        xpm = player.get("xp_per_min", 0)
        damage = player.get("hero_damage", 0)
        heal = player.get("hero_healing", 0)
        building_damage = player.get("tower_damage", 0)
        wards_placed = player.get("wards_placed", 0)
        items = [player.get(f"item_{i}", 0) for i in range(6)]
        create_match_player_stats(cursor, match_history_id, steam_id,
                                  hero_id, kills, deaths, assists, net_worth,
                                  last_hits, denies, gpm, xpm, damage, heal,
                                  building_damage, wards_placed, items)
    conn.commit()
    conn.close()
    print(f"[MATCH_HISTORY] Successfully stored match history for match_id: {match_id}")
