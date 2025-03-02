import sys
import gevent
import datetime

from steam.enums import EResult
from steam.client import SteamID
from steam.client import SteamClient
from dota2.client import Dota2Client

from discord_db import (
    execute_function_single_row_return,
    execute_function_no_return,
    execute_function_with_return
)

steam_client = SteamClient()
dota_client = Dota2Client(steam_client)
dota_client.socache._LOG.disabled = True
dota_client._LOG.disabled = True

# Event callback: runs each time the lobby changes (players join/leave, etc.)
@dota_client.on("lobby_changed")  # type: ignore
def lobby_change(lobby):
    if starting:
        return
    for lobby_player in lobby.all_members:
        # Convert this Dota lobby player's integer ID to string.
        steam_id_str = str(lobby_player.id)

        # Find the matching player from our DB list (which also stores steam_id as string).
        player = next(
            (p for p in players if p["steam_id"] == steam_id_str),
            None
        )

        if player is not None:
            old_checkin = players_that_checkin[steam_id_str]

            # Mark this player as arrived if their team matches the DB record's team
            players_that_checkin[steam_id_str] = (player["team"] == lobby_player.team)

            # If the check-in status changed since last time, update DB
            if old_checkin != players_that_checkin[steam_id_str]:
                if players_that_checkin[steam_id_str]:
                    # Player arrived
                    execute_function_no_return("set_player_arrived", game_id, player["id"])
                else:
                    # Player left
                    execute_function_no_return("set_player_left", game_id, player["id"])

        check_to_start()

def create_lobby():
    dota_client.destroy_lobby()
    lobby_options = {
        "game_mode": game_mod,
        "allow_cheats": False,
        "game_name": lobby_name,
        "server_region": 3,
        "allow_spectating": True,
        "leagueid": league_id,
    }
    dota_client.create_practice_lobby(lobby_password, lobby_options)
    dota_client.wait_event("lobby_new")
    _log(f"Lobby {dota_client.lobby.__getattribute__('lobby_id')} created")  # type: ignore
    dota_client.join_practice_lobby_team()
    gevent.spawn_later(lobby_timeout, timeout_game)

def invite_players():
    # Convert each DB steam_id to int for SteamID(), handling invalid entries
    for player in players:
        steam_id_str = player["steam_id"]
        try:
            steam_id_int = int(steam_id_str)
            dota_client.invite_to_lobby(SteamID(steam_id_int))
        except ValueError:
            dota_client.invite_to_lobby(SteamID(steam_id_str))
            _log(f"Invalid Steam ID '{steam_id_str}' for player {player['id']}, skipping invite.")
    _log("Invited players")

def check_to_start():
    global starting
    # If all players are checked in (arrived), start the game
    if list(players_that_checkin.values()).count(True) == len(players) and not starting:
        starting = True
        _log("Starting lobby")
        dota_client.launch_practice_lobby()
        gevent.sleep(10)
        _log("Disconnecting from lobby")
        dota_client.abandon_current_game()
        steam_client_logout()
        execute_function_no_return("set_game_status_started", game_id)
        execute_function_no_return("free_bot", steam_bot["username"])
        exit(0)

def destrony_lobby():
    _log("Destroying lobby")
    dota_client.destroy_lobby()

def steam_client_logout():
    _log("Logging out of Steam")
    steam_client.logout()

def cleanup():
    destrony_lobby()
    steam_client_logout()
    execute_function_no_return("free_bot", steam_bot["username"])

def abort_game():
    cleanup()
    execute_function_no_return("set_game_status_aborted", game_id)
    exit(1)

def timeout_game():
    cleanup()
    execute_function_no_return("set_game_status_timeout", game_id)
    exit(1)

def _log(message, level="BOT "):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [{level}{steam_bot['username']}] {message}")


if __name__ == "__main__":
    if len(sys.argv) < 6:
        print("not enough arguments")
        exit(1)

    game_id = sys.argv[1]
    steam_bot_id = sys.argv[2]
    league_id = int(sys.argv[3])
    game_mod = int(sys.argv[4])
    lobby_timeout = int(sys.argv[5])

    steam_bot = execute_function_single_row_return("get_steam_bot", steam_bot_id)
    game_args = execute_function_single_row_return("get_game_args", game_id)
    lobby_name = game_args["lobby_name"]    # type: ignore
    lobby_password = game_args["lobby_password"]  # type: ignore

    # Retrieve all players from DB for this game
    players = execute_function_with_return("get_all_players_from_game", game_id)

    # Create dict keyed by string steam_id, value = False (not arrived yet)
    players_that_checkin = {}
    for p in players:
        # p["steam_id"] is presumably text from the DB
        players_that_checkin[p["steam_id"]] = False

    _log(f"Logging in as {steam_bot['username']}")
    result = steam_client.login(username=steam_bot["username"], password=steam_bot["password"])
    if result != EResult.OK:
        _log(f"Steam login failed with result {result}")
        execute_function_no_return("free_bot", steam_bot["username"])
        exit(1)

    _log("Login successful")
    _log("Launching Dota 2 client")

    dota_client.launch()
    try:
        _log("Waiting for Dota 2 to be ready")
        dota_client.wait_event("ready", timeout=20, raises=True)
        _log("Dota2 ready")
    except gevent.Timeout:
        execute_function_no_return("free_bot", steam_bot["username"])
        exit(1)

    try:
        starting = False
        create_lobby()
        invite_players()
        execute_function_no_return("set_game_status_hosted", game_id)

        while True:
            game = execute_function_single_row_return("get_game", game_id)
            if game["status"] == "CANCEL":
                abort_game()
            gevent.sleep(15)

    except Exception as e:
        _log(f"Exception: {e}")
        abort_game()
