import time
import subprocess
import datetime
import yaml
import sys

from discord_db import execute_function_single_row_return, execute_function_no_return

yaml_path = 'league_settings_dev.yaml' if len(
    sys.argv) > 1 and sys.argv[1] == 'dev' else 'league_settings.yaml'

def _log(message, level='ORCHESTRATOR'):
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f'[{timestamp}] [{level}] {message}')

#read from yaml file league_settings 
with open(yaml_path) as f:
    league_settings = yaml.load(f, Loader=yaml.FullLoader)
    league_id = league_settings.get('league_id', 0)
    game_mod = league_settings.get('game_mod', 16)
    lobby_timeout = league_settings.get('lobby_timeout', 300)

while True:
    time.sleep(10)
    _log('Looking for games...')
    try:
        id = execute_function_single_row_return('get_game_id_where_status_pregame')['id']
    except ValueError:
        id = None
    if id:
        _log('Found game, getting ready')
        try:
            bot = execute_function_single_row_return('get_free_bot')
            execute_function_no_return('reserve_bot', bot['id'])
            creationflags = subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == "win32" else 0
            lobby_process = subprocess.Popen(['python3', 'lobby.py', str(id), str(bot['id']), str(league_id), str(game_mod), str(lobby_timeout)],
                             creationflags=creationflags)
            
        except ValueError:
            _log('No bot to run the game, waiting...')
            continue
    try: 
        rehost_id = execute_function_single_row_return('get_game_id_where_status_rehost')['id']
    except ValueError:
        rehost_id = None
    if rehost_id:
        execute_function_no_return('set_game_status_pregame', rehost_id)



