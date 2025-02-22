import sys
import gevent
import datetime

from steam.enums import EResult
from steam.client import SteamID
from steam.client import SteamClient
from dota2.client import Dota2Client

from discord_db import execute_function_single_row_return, execute_function_no_return, execute_function_with_return


steam_client = SteamClient()
dota_client = Dota2Client(steam_client)
dota_client.socache._LOG.disabled = True
dota_client._LOG.disabled = True


@dota_client.on('lobby_changed')  #type: ignore
def lobby_change(lobby):
    if starting:
        return
    for lobby_player in lobby.all_members:
        player = next((p for p in players if p['steam_id'] == lobby_player.id), None)
        if player is not None:
            old_checkin = players_that_checkin[lobby_player.id]
            players_that_checkin[lobby_player.id] =  player['team'] == lobby_player.team
            if old_checkin != players_that_checkin[lobby_player.id]:
                if players_that_checkin[lobby_player.id]:
                    execute_function_no_return('set_player_arrived', game_id, player['id'])
                else:
                    execute_function_no_return('set_player_left', game_id, player['id'])
        check_to_start()

def create_lobby():
    dota_client.destroy_lobby()
    #steam_client.idle()
    lobby_options = {
        "game_mode": game_mod,  # CAPTAINS DRAFT
        "allow_cheats": False,
        "game_name": lobby_name,
        "server_region": 3,
        "allow_spectating": True,
        "leagueid" : league_id,
    }
    dota_client.create_practice_lobby(lobby_password, lobby_options)
    dota_client.wait_event('lobby_new')
    _log('Lobby {} created'.format(dota_client.lobby.__getattribute__('lobby_id'))) #type: ignore
    dota_client.join_practice_lobby_team()
    gevent.spawn_later(lobby_timeout, timeout_game) #abort game in 5 minutes if not started

def invite_players():
    for player in (SteamID(p['steam_id']) for p in players):
        dota_client.invite_to_lobby(player)
    _log('Invited playes')

def check_to_start():
    global starting
    if list(players_that_checkin.values()).count(True) == len(players) and not starting:
        starting = True
        _log('Starting lobby')
        dota_client.launch_practice_lobby()
        gevent.sleep(10)
        _log('Disconnecting from lobby')
        dota_client.abandon_current_game()
        steam_client_logout()
        execute_function_no_return('set_game_status_started', game_id)
        execute_function_no_return('free_bot', steam_bot['username'])
        exit(0)

def destrony_lobby():
    _log('Destroying lobby')
    dota_client.destroy_lobby()

def steam_client_logout():
    _log('Loging out of steam')
    steam_client.logout()

def cleanup():
    destrony_lobby()
    steam_client_logout()
    execute_function_no_return('free_bot', steam_bot["username"])

def abort_game():
    cleanup()
    execute_function_no_return('set_game_status_aborted', game_id)
    exit(1)

def timeout_game():
    cleanup()
    execute_function_no_return('set_game_status_timeout', game_id)
    exit(1)

def _log(message, level='BOT '):
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f'[{timestamp}] [{level}{steam_bot["username"]}] {message}')


if __name__ == '__main__':
    if len(sys.argv) < 6:
        _log('not enough arguments')
        exit(1)

    game_id = sys.argv[1]
    steam_bot_id = sys.argv[2]
    league_id = int(sys.argv[3])
    game_mod = int(sys.argv[4])
    lobby_timeout = int(sys.argv[5])

    steam_bot  = execute_function_single_row_return('get_steam_bot', steam_bot_id)
    game_args = execute_function_single_row_return('get_game_args', game_id)
    lobby_name = game_args['lobby_name']  #type: ignore
    lobby_password = game_args['lobby_password']  #type: ignore
    
    players  = execute_function_with_return('get_all_players_from_game', game_id)
    players_that_checkin = {}
    for player in players:
        players_that_checkin[player['steam_id']] = False

    _log('Logging in as {}'.format(steam_bot['username']))
    result = steam_client.login(username=steam_bot['username'], password= steam_bot['password'])
    if result != EResult.OK:
        _log('Steam login failed with result {}'.format(result))
        execute_function_no_return('free_bot', steam_bot['username'])
        exit(1)
            
    _log('Login successfull')

    _log('Launching dota 2 client')
    dota_client.launch()
    try:
        _log('Waiting for dota to be ready')
        dota_client.wait_event('ready', timeout=20, raises=True)
        _log('Dota2 ready')
    except gevent.Timeout:
        execute_function_no_return('free_bot', steam_bot['username'])
        exit(1)
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
