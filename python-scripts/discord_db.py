import sqlite3
import json
import os
import asyncio

from typing import Any, List, Union
from sqlite3 import Connection, Cursor
from models.errors import DataBaseErrorNonModified
from utility import calculate_elo, dict_factory

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.getenv("DATABASE_PATH", os.path.join(BASE_DIR, "db", "league.db"))
# DB_PATH_FILE = 'file:db/league.db'
STEAM_ACCOUNTS_PATH = 'steam_bot_acc.json'

# Player


def get_all_players(cursor: Cursor) -> None:
    cursor.execute('SELECT * FROM Players')


def add_player(cursor: Cursor, discord_id: str, steam_id: str, name: str, mmr: str) -> None:
    cursor.execute('''INSERT INTO Players(discord_id, steam_id, name, mmr)
                      VALUES(?,?,?,?)''', (discord_id, steam_id, name, mmr))


def get_player_id(cursor: Cursor, discord_id: str) -> None:
    cursor.execute(
        'SELECT id FROM Players WHERE discord_id = ?', (discord_id, ))


def get_player(cursor: Cursor, discord_id: str) -> None:
    cursor.execute(
        'SELECT * FROM Players WHERE discord_id = ?', (discord_id, ))


def update_player_mmr_won(cursor: Cursor, id: str, elo_change: str) -> None:
    cursor.execute(
        f'''UPDATE Players SET mmr = mmr + ? WHERE id = ?''', (elo_change, id))


def update_player_mmr_lost(cursor: Cursor, id: str, elo_change: str) -> None:
    cursor.execute(
        f'''UPDATE Players SET mmr = mmr - ? WHERE id = ?''', (elo_change, id))


def get_player_rank(cursor: Cursor, id: str) -> None:
    cursor.execute(
        f'''SELECT discord_id, mmr, (SELECT COUNT(*) FROM Players p WHERE p.mmr > p2.mmr and EXISTS(select * from Game g join GamePlayers gp on g.id = gp.game_id WHERE g.status = 'OVER' and gp.player_id = p.id )) + 1 AS rank FROM Players p2 WHERE id = ?''', (id,))


def reset_all_player_mmr(cursor: Cursor) -> None:
    cursor.execute(
        f'''UPDATE Players SET mmr = 1000''')


def get_if_player_played_game(cursor: Cursor, id: str) -> None:
    cursor.execute(
        f'''SELECT count(*) as played FROM GamePlayers gp join Game g on gp.game_id = g.id where gp.player_id = ? and g.status = 'OVER' LIMIT 1''', (id,))


def get_players_wins_and_losses(cursor: Cursor, id: str) -> None:
    cursor.execute(
        f'''SELECT (SELECT COUNT(*) FROM GamePlayers gp join Game g on gp.game_id = g.id where gp.player_id = ? and g.status = 'OVER' and gp.team = g.result) as wins, (SELECT COUNT(*) FROM GamePlayers gp join Game g on gp.game_id = g.id where gp.player_id = ? and g.status = 'OVER' and gp.team <> g.result) as losses''', (id, id))

#PlayerRoles

def delete_player_roles(cursor: Cursor, player_id: str) -> None:
    cursor.execute(
        f'''DELETE FROM PlayerRoles WHERE player_id = ?''', (player_id, ))

def set_player_role(cursor: Cursor, player_id: str, role: str) -> None:
    cursor.execute(
        f'''INSERT INTO PlayerRoles(player_id, role) VALUES(?,?)''', (player_id, role))
    
def get_player_role(cursor: Cursor, player_id: str) -> None:
    cursor.execute(
        f'''SELECT role FROM PlayerRoles WHERE player_id = ?''', (player_id, ))

def set_player_captain(cursor: Cursor, id: str) -> None:
    cursor.execute(
        f'''UPDATE Players SET captain = 1 WHERE id = ?''', (id, ))

def unset_player_captain(cursor: Cursor, id: str) -> None:
    cursor.execute(
        '''UPDATE Players SET captain = 0 WHERE id = ?''', (id,)
    )

# Game


def get_game(cursor: Cursor, id: str) -> None:
    cursor.execute('SELECT * FROM Game WHERE id = ?', (id, ))


def add_game(cursor: Cursor, type: str) -> None:
    cursor.execute(
        '''INSERT INTO Game(status, result, steam_match_id, type, game_created_at) VALUES(?, ?, ?, ?)''', ('PREGAME', None, None, type))


def set_game_status_aborted(cursor: Cursor, id: str) -> None:
    cursor.execute(
        '''UPDATE Game SET status = ? WHERE id = ?''', ('ABORTED', id))


def set_game_status_pregame(cursor: Cursor, id: str) -> None:
    cursor.execute(
        '''UPDATE Game SET status = ? WHERE id = ?''', ('PREGAME', id))


def get_game_id_where_status_pregame(cursor: Cursor) -> None:
    cursor.execute(
        'SELECT Id FROM Game WHERE status = ? LIMIT 1', ('PREGAME', ))


def set_game_status_hosted(cursor: Cursor, game_id: str) -> None:
    cursor.execute(
        '''UPDATE Game SET status = 'HOSTED' WHERE id = ?''', (game_id,))

def set_game_status_hosting(cursor: Cursor, game_id: str) -> None:
    cursor.execute(
        '''UPDATE Game SET status = 'HOSTING' WHERE id = ?''', (game_id,))



def score_game(cursor: Cursor, game_id: str, result: int, steam_match_id) -> None:
    cursor.execute(
        f'''UPDATE Game SET result = ?, status = 'OVER', steam_match_id = ? WHERE id = ?''', (result, steam_match_id, game_id))


def set_game_status_started(cursor: Cursor, game_id: str) -> None:
    cursor.execute(
        '''UPDATE Game SET status = 'STARTED', game_started_at = CURRENT_TIMESTAMP WHERE id = ?''', (game_id,))


def get_game_id_where_status_rehost(cursor: Cursor) -> None:
    cursor.execute(
        'SELECT Id FROM Game WHERE status = ? LIMIT 1', ('REHOST', ))


def get_game_id_where_status_cancel(cursor: Cursor) -> None:
    cursor.execute(
        'SELECT Id FROM Game WHERE status = ? LIMIT 1', ('CANCEL', ))


def set_game_status_cancel(cursor: Cursor, game_id: str) -> None:
    cursor.execute(
        '''UPDATE Game SET status = 'CANCEL' WHERE id = ?''', (game_id,))


def set_game_status_rehost(cursor: Cursor, game_id: str) -> None:
    cursor.execute(
        '''UPDATE Game SET status = 'REHOST' WHERE id = ?''', (game_id,))


def get_games_where_status_over(cursor: Cursor) -> None:
    cursor.execute(
        'SELECT * FROM Game WHERE status = ?', ('OVER', ))


def get_scored_games_with_steam_match_id(cursor: Cursor) -> None:
    cursor.execute(
        'SELECT steam_match_id FROM Game WHERE status = ? and steam_match_id is not NULL and steam_match_id <> 0', ('OVER', ))


def get_active_games(cursor: Cursor) -> None:
    cursor.execute('SELECT * FROM Game WHERE status = "STARTED"')

def set_game_status_timeout(cursor: Cursor, game_id: str) -> None:
    cursor.execute(
        '''UPDATE Game SET status = 'TIMEOUT' WHERE id = ?''', (game_id,))
    
def get_game_where_status_timeout(cursor: Cursor) -> None:
    cursor.execute(
        '''SELECT * FROM Game WHERE status = 'TIMEOUT' ''')

# GamePlayers


def add_player_to_game(cursor: Cursor, game_id: str, player_id: str, team: str) -> None:
    cursor.execute(
        '''INSERT INTO GamePlayers(game_id, player_id, team) VALUES(?,?,?)''', (game_id, player_id, team))


def get_all_players_from_game(cursor: Cursor, game_id: str) -> None:
    cursor.execute(
        'SELECT p.id, discord_id, steam_id, mmr, gp.team as team FROM GamePlayers gp join Players p on gp.player_id = p.id WHERE game_id = ?', (game_id, ))
    
def set_player_arrived(cursor: Cursor, game_id: str, player_id: str) -> None:
    cursor.execute(
        'UPDATE GamePlayers SET arrived = 1 WHERE game_id = ? and player_id = ?', (game_id, player_id))
    
def set_player_left(cursor: Cursor, game_id: str, player_id: str) -> None:
    cursor.execute(
        'UPDATE GamePlayers SET arrived = 0 WHERE game_id = ? and player_id = ?', (game_id, player_id))    

def get_players_arrived(cursor: Cursor, game_id: str) -> None:
    cursor.execute(
        'SELECT p.discord_id as id FROM GamePlayers gp JOIN Players p on gp.player_id = p.id WHERE game_id = ? and arrived = 1', (game_id, ))

def reset_all_players_arrived(cursor: Cursor, game_id: str) -> None:
    cursor.execute(
        'UPDATE GamePlayers SET arrived = 0 WHERE game_id = ?', (game_id, ))
# GameArgs


def add_game_args(cursor: Cursor, game_id: str, lobby_name: str, lobby_password: str) -> None:
    cursor.execute('''INSERT INTO GameArgs(game_id, lobby_name, lobby_password) VALUES(?,?,?)''',
                   (game_id, lobby_name, lobby_password))


def get_game_args(cursor: Cursor, game_id: str) -> None:
    cursor.execute(
        'SELECT lobby_name,lobby_password FROM GameArgs WHERE game_id = ?', (game_id, ))

# SteamBots


def add_bot(cursor: Cursor, username: str, password: str) -> None:
    cursor.execute(
        '''INSERT INTO SteamBots(username, password, status) VALUES(?,?,0)''', (username, password))


def get_free_bot(cursor: Cursor) -> None:
    cursor.execute('''SELECT * FROM SteamBots WHERE status = 0 LIMIT 1''')


def get_steam_bot(cursor: Cursor, id: str) -> None:
    cursor.execute('''SELECT * FROM SteamBots WHERE id = ?''', (id,))


def reserve_bot(cursor: Cursor, id: str) -> None:
    cursor.execute('''UPDATE SteamBots SET status = 1 WHERE id = ?''', (id,))


def get_bot_from_username(cursor: Cursor, username: str) -> None:
    cursor.execute(
        f'''SELECT * FROM SteamBots WHERE username = ?''', (username,))


def free_bot(cursor: Cursor, username: str) -> None:
    cursor.execute(
        f'''UPDATE SteamBots SET status = 0 WHERE username = ?''', (username,))


# Agreagtion
def get_leaderboards(cursor: Cursor) -> None:
    cursor.execute("""
    SELECT discord_id, 
           mmr
    FROM players
    WHERE id in (select player_id from gameplayers where game_id in (select id from game where status = 'OVER')) 
    ORDER BY mmr DESC

    """)


def create_tables(cursor: Connection) -> None:
    cursor.execute('''CREATE TABLE IF NOT EXISTS Players
                            (id INTEGER PRIMARY KEY,
                            discord_id TEXT  ,
                            steam_id TEXT,
                            name TEXT,
                            mmr INTEGER,
                            captain INTEGER DEFAULT 0)''')

    # status PREGAME | HOSTED | STARTED | OVER | ABORTED | CANCEL | REHOST
    # status PREGAME => HOSTED => STARTED => OVER(score)
    # status PREAGME => HOSTED => TIMEOUTE (5 min timeout) => ABORTED
    # status PREGAME => HOSTED => CANCEL(cancel) => ABORTED
    # status PREGAME => REHOST(rehost) => PREGAME

    # type DRAFT | NORMAL

    cursor.execute('''CREATE TABLE IF NOT EXISTS Game
                            (id INTEGER PRIMARY KEY,
                            status TEXT  , 
                            result INTEGER,
                            steam_match_id INTEGER,
                            type TEXT,
                            game_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            game_started_at TIMESTAMP)''')

    cursor.execute('''CREATE TABLE IF NOT EXISTS GamePlayers
                    (id INTEGER PRIMARY KEY,
                    game_id INTEGER,
                    player_id INTEGER,
                    team INTEGER,
                    arrived INTEGER DEFAULT 0,
                    FOREIGN KEY(game_id) REFERENCES Game(id),
                    FOREIGN KEY(player_id) REFERENCES Player(id))''')

    cursor.execute('''CREATE TABLE IF NOT EXISTS GameArgs
                    (id INTEGER PRIMARY KEY,
                    game_id INTEGER,
                    lobby_name TEXT,
                    lobby_password TEXT,
                    FOREIGN KEY(game_id) REFERENCES Game(id))''')

    cursor.execute('''CREATE TABLE IF NOT EXISTS SteamBots
                    (id INTEGER PRIMARY KEY,
                    username TEXT,
                    password TEXT,
                    status INTEGER)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS PlayerRoles
                    (id INTEGER PRIMARY KEY,
                    player_id INTEGER,
                    role INTEGER,
                    FOREIGN KEY(player_id) REFERENCES Player(id))''')

# wrapper functions


def execute_function_no_return(function_name: str, *args: Union[str, int]) -> None:
    conn: Connection = sqlite3.connect(DB_PATH, uri=True)
    conn.execute('PRAGMA journal_mode=WAL')
    cursor: Cursor = conn.cursor()
    function = globals()[function_name]
    for _ in range(5):
        try:
            function(cursor, *args)
            if cursor.rowcount <= 0:
                conn.close()
                raise DataBaseErrorNonModified('No rows updated')
            conn.commit()
            conn.close()
            return
        except sqlite3.OperationalError as e:
            if 'database is locked' in str(e):
                asyncio.sleep(0.2)
            else:
                conn.close()
                raise e

    raise sqlite3.OperationalError('Database is busy')


def execute_insert_and_return_id(function_name: str, *args: Union[str, int]) -> int:
    conn: Connection = sqlite3.connect(DB_PATH, uri=True)
    conn.execute('PRAGMA journal_mode=WAL')
    conn.row_factory = dict_factory
    cursor: Cursor = conn.cursor()
    function = globals()[function_name]
    for _ in range(5):
        try:
            function(cursor, *args)
            id = cursor.lastrowid
            if not id:
                conn.close()
                raise ValueError('No rows found')
            conn.commit()
            conn.close()
            return id
        except sqlite3.OperationalError as e:
            if 'database is locked' in str(e):
                asyncio.sleep(0.2)
            else:
                conn.close()
                raise e
    raise sqlite3.OperationalError('Database is busy')


def execute_function_single_row_return(function_name: str, *args: Union[str, int]) -> Any:
    conn: Connection = sqlite3.connect(DB_PATH, uri=True)
    conn.execute('PRAGMA journal_mode=WAL')
    conn.row_factory = dict_factory
    cursor: Cursor = conn.cursor()
    function = globals()[function_name]
    function(cursor, *args)
    result = cursor.fetchone()
    conn.close()
    if not result:
        raise ValueError('No rows found')
    return result


def execute_function_with_return(function_name: str, *args: Union[str, int]) -> list[Any]:
    conn: Connection = sqlite3.connect(DB_PATH, uri=True)
    conn.execute('PRAGMA journal_mode=WAL')
    conn.row_factory = dict_factory
    cursor: Cursor = conn.cursor()
    function = globals()[function_name]
    function(cursor, *args)
    result = cursor.fetchall()
    conn.close()
    return result if result else []

# database generic querys
def custom_query(cursor: Cursor, query: str) -> None:
    cursor.execute(query)


# maintenance functions
def ensure_database_exists() -> None:
    if not os.path.exists(DB_PATH):
        open(DB_PATH, 'w').close()
        try:
            execute_function_no_return('create_tables')
        except DataBaseErrorNonModified:
            pass
        register_steam_bots()


def recalculate_mmr() -> None:
    execute_function_no_return('reset_all_player_mmr')
    games = execute_function_with_return('get_games_where_status_over')
    for game in games:
        players = execute_function_with_return(
            'get_all_players_from_game', game['id'])
        radian_players = [player for player in players if player['team'] == 0]
        dire_players = [player for player in players if player['team'] == 1]
        radian_players_avg_mmr = sum(
            [player['mmr'] for player in radian_players]) / len(radian_players)
        dire_players_avg_mmr = sum(
            [player['mmr'] for player in dire_players]) / len(dire_players)
        elo_change = calculate_elo(
            radian_players_avg_mmr, dire_players_avg_mmr, 1 if game['result'] == 0 else -1)
        for player in players:
            if player['team'] == game['result']:
                execute_function_no_return(
                    'update_player_mmr_won', player['id'], elo_change)
            else:
                execute_function_no_return(
                    'update_player_mmr_lost', player['id'], elo_change)


def reset_league() -> None:
    execute_function_no_return('custom_query', 'DELETE FROM Game')
    execute_function_no_return('custom_query', 'DELETE FROM GamePlayers')
    execute_function_no_return('custom_query', 'DELETE FROM GameArgs')
    execute_function_no_return('reset_all_player_mmr')


def register_steam_bots() -> None:
    with open(STEAM_ACCOUNTS_PATH) as f:
        bots = json.load(f)
    if len(bots) == 0:
        raise ValueError('No steam bots found, Please add them to steam_bot_acc.json')
    for bot in bots:
        try:
            execute_function_single_row_return(
                'add_bot', bot['username'], bot['password'])
        except ValueError:
            execute_function_no_return(
                'add_bot', bot['username'], bot['password'])


def print_data_base(filter: List[str] = []):
    conn = sqlite3.connect(DB_PATH, uri=True)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    for table in tables:
        if table[0] not in filter:
            cursor.execute(f"SELECT * FROM {table[0]}")
            rows = cursor.fetchall()
            print(f"{table[0]}:")
            if len(rows) > 0:
                column_names = [description[0]
                                for description in cursor.description]
                print(column_names)
                for row in rows:
                    print(row)
            else:
                print("Table is empty")
    conn.close()


if __name__ == '__main__':
    ensure_database_exists()
    print_data_base()
