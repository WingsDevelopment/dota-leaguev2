import time
import subprocess
import datetime
import yaml
import sys
import os

from discord_db import execute_function_single_row_return, execute_function_no_return

# Determine the YAML file to use based on command-line arguments
yaml_path = 'league_settings_dev.yaml' if len(sys.argv) > 1 and sys.argv[1] == 'dev' else 'league_settings.yaml'

def _log(message, level='INFO    '):
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f'[{timestamp}] [{level}] {message}', flush=True)

# Read settings from the YAML file
_log(f"Reading settings from {yaml_path}")
with open(yaml_path) as f:
    league_settings = yaml.load(f, Loader=yaml.FullLoader)
    league_id = league_settings.get('league_id', 0)
    game_mod = league_settings.get('game_mod', 16)
    lobby_timeout = league_settings.get('lobby_timeout', 300)
    _log(f"Loaded settings: league_id={league_id}, game_mod={game_mod}, lobby_timeout={lobby_timeout}")

while True:
    time.sleep(10)
    _log('Looking for games...')
    try:
        game_record = execute_function_single_row_return('get_game_id_where_status_pregame')
        game_id = game_record['id']
        _log(f'Found game in PREGAME status with ID: {game_id}')
    except ValueError:
        _log('No game in PREGAME status found')
        game_id = None

    if game_id:
        _log('Preparing to launch lobby for game ID: ' + str(game_id))
        try:
            bot_record = execute_function_single_row_return('get_free_bot')
            _log(f"Retrieved free bot: {bot_record}")
            execute_function_no_return('reserve_bot', bot_record['id'])
            _log(f"Reserved bot with ID: {bot_record['id']}")
            
            cmd = [sys.executable, 'lobby.py', str(game_id), str(bot_record['id']), str(league_id), str(game_mod), str(lobby_timeout)]
            _log(f"Launching lobby.py with command: {' '.join(cmd)}")
            
            if os.name == 'nt':
                lobby_process = subprocess.Popen(cmd, creationflags=subprocess.CREATE_NEW_PROCESS_GROUP)
            else:
                lobby_process = subprocess.Popen(cmd, preexec_fn=os.setsid)
            
            _log("Lobby process launched successfully.")
        except ValueError as e:
            _log(f'No free bot available to run the game: {e}, waiting...')
            continue

    try:
        rehost_record = execute_function_single_row_return('get_game_id_where_status_rehost')
        rehost_id = rehost_record['id']
        _log(f"Found game in REHOST status with ID: {rehost_id}")
    except ValueError:
        _log("No game in REHOST status found")
        rehost_id = None

    if rehost_id:
        execute_function_no_return('set_game_status_pregame', rehost_id)
        _log(f"Set game ID {rehost_id} status to PREGAME")
