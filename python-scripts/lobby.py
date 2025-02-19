#!/usr/bin/env python3
import sys
import time
import datetime
import os
import gevent

from steam.client import SteamID, SteamClient
from dota2.client import Dota2Client
from steam.enums import EResult
from discord_db import (
    execute_function_single_row_return,
    execute_function_no_return,
    execute_function_with_return
)

# Logging helper
def _log(message, level='INFO'):
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{timestamp}] [{level}] {message}", flush=True)

# Helper function: wait for game args row to be present
def wait_for_game_args(game_id: str, timeout: int = 30):
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            game_args = execute_function_single_row_return('get_game_args', game_id)
            _log(f"GameArgs found: {game_args}", level="DEBUG")
            return game_args
        except ValueError:
            _log("GameArgs not found yet, waiting...", level="DEBUG")
            time.sleep(1)
    raise ValueError(f"GameArgs not found for game_id {game_id} after {timeout} seconds.")

# Global variables (to be set in lobby_main)
starting = False
game_id = None
steam_bot = None
league_id = None
game_mod = None
lobby_timeout = None
lobby_name = None
lobby_password = None
players = None
players_that_checkin = {}

# Create a SteamClient and Dota2Client.
steam_client = SteamClient()
dota_client = Dota2Client(steam_client)
# Optionally disable extra logging:
dota_client.socache._LOG.disabled = True
dota_client._LOG.disabled = True

@dota_client.on('lobby_changed')  # type: ignore
def lobby_change(lobby):
    global starting
    if starting:
        return
    for lobby_player in lobby.all_members:
        # Look for a matching player by steam_id
        player = next((p for p in players if p['steam_id'] == lobby_player.id), None)
        if player is not None:
            old_checkin = players_that_checkin.get(lobby_player.id, False)
            players_that_checkin[lobby_player.id] = (player['team'] == lobby_player.team)
            if old_checkin != players_that_checkin[lobby_player.id]:
                if players_that_checkin[lobby_player.id]:
                    execute_function_no_return('set_player_arrived', game_id, player['id'])
                else:
                    execute_function_no_return('set_player_left', game_id, player['id'])
        check_to_start()

def create_lobby():
    _log("Destroying any existing lobby...")
    dota_client.destroy_lobby()
    lobby_options = {
        "game_mode": game_mod,
        "allow_cheats": False,
        "game_name": lobby_name,
        "server_region": 3,
        "allow_spectating": True,
        "leagueid": league_id,
    }
    _log(f"Creating a new lobby with options: {lobby_options} and password: {lobby_password}")
    dota_client.create_practice_lobby(lobby_password, lobby_options)
    try:
        _log("Waiting for 'lobby_new' event...")
        event = dota_client.wait_event('lobby_new', timeout=20)
        _log(f"'lobby_new' event received: {event}")
    except Exception as e:
        _log(f"Error or timeout waiting for 'lobby_new' event: {e}")
        abort_game()
    current_lobby_id = getattr(dota_client.lobby, 'lobby_id', None)
    _log(f"Lobby {current_lobby_id} created successfully.")
    _log("Joining practice lobby team...")
    dota_client.join_practice_lobby_team()
    gevent.spawn_later(lobby_timeout, timeout_game)

def invite_players():
    for p in players:
        player_obj = SteamID(p['steam_id'])
        dota_client.invite_to_lobby(player_obj)
    _log("Invited players")

def check_to_start():
    global starting
    if list(players_that_checkin.values()).count(True) == len(players) and not starting:
        starting = True
        _log("All players checked in. Starting lobby.")
        dota_client.launch_practice_lobby()
        gevent.sleep(10)
        _log("Disconnecting from lobby")
        dota_client.abandon_current_game()
        execute_function_no_return('set_game_status_started', game_id)
        execute_function_no_return('free_bot', steam_bot['username'])
        sys.exit(0)

def destrony_lobby():
    _log("Destroying lobby")
    dota_client.destroy_lobby()

def cleanup():
    destrony_lobby()
    execute_function_no_return('free_bot', steam_bot["username"])

def abort_game():
    cleanup()
    execute_function_no_return('set_game_status_aborted', game_id)
    sys.exit(1)

def timeout_game():
    cleanup()
    execute_function_no_return('set_game_status_timeout', game_id)
    sys.exit(1)

def lobby_main():
    global game_id, steam_bot, league_id, game_mod, lobby_timeout, lobby_name, lobby_password, players, players_that_checkin, starting
    if len(sys.argv) < 6:
        _log("Not enough arguments", level="ERROR")
        sys.exit(1)
    game_id = sys.argv[1]
    steam_bot_id = sys.argv[2]
    league_id = int(sys.argv[3])
    game_mod = int(sys.argv[4])
    lobby_timeout = int(sys.argv[5])
    steam_bot = execute_function_single_row_return('get_steam_bot', steam_bot_id)
    # Wait for GameArgs row to be available (which holds lobby_name and lobby_password)
    try:
        game_args = wait_for_game_args(game_id, timeout=30)
    except ValueError as e:
        _log(f"Failed to get game args: {e}", level="ERROR")
        sys.exit(1)
    lobby_name = game_args['lobby_name']
    lobby_password = game_args['lobby_password']
    players = execute_function_with_return('get_all_players_from_game', game_id)
    players_that_checkin = {}
    for p in players:
        players_that_checkin[p['steam_id']] = False

    _log("Launching Dota 2 client")
    dota_client.launch()
    try:
        _log("Waiting for Dota 2 to be ready")
        dota_client.wait_event('ready', timeout=20, raises=True)
        _log("Dota2 ready")
    except gevent.Timeout:
        execute_function_no_return('free_bot', steam_bot['username'])
        sys.exit(1)
    try:
        starting = False
        create_lobby()
        invite_players()
        execute_function_no_return('set_game_status_hosted', game_id)
        while True:
            game = execute_function_single_row_return('get_game', game_id)
            if game['status'] == 'CANCEL':
                abort_game()
            gevent.sleep(15)
    except Exception as e:
        _log(e)
        abort_game()

if __name__ == '__main__':
    _log("Starting lobby process (lobby.py)...")
    lobby_main()
