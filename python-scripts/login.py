#!/usr/bin/env python3
import sys
import datetime
import os
from steam.enums import EResult
from steam.client import SteamClient
from discord_db import execute_function_single_row_return, execute_function_no_return

def _log(message, level='INFO'):
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{timestamp}] [{level}] {message}", flush=True)

def login_steam(steam_client, steam_bot):
    _log(f"Logging in as {steam_bot['username']}")
    if not steam_client.logged_on:
        result = steam_client.login(username=steam_bot['username'], password=steam_bot['password'])
        if result != EResult.OK:
            if result == 85:
                _log("Steam login failed with result 85. Two-factor code required. Please enter the Steam Guard Code:")
                code = input("Enter Steam Guard Code: ")
                result = steam_client.login(username=steam_bot['username'], 
                                            password=steam_bot['password'], 
                                            two_factor_code=code)
                if result != EResult.OK:
                    _log(f"Steam login failed with result {result}")
                    execute_function_no_return('free_bot', steam_bot['username'])
                    sys.exit(1)
            else:
                _log(f"Steam login failed with result {result}")
                execute_function_no_return('free_bot', steam_bot['username'])
                sys.exit(1)
        _log("Login successful")
    else:
        _log(f"Already logged in as {steam_bot['username']}")
    return steam_client

def main():
    if len(sys.argv) < 2:
        _log("Usage: python login.py <steam_bot_id>", level="ERROR")
        sys.exit(1)
    steam_bot_id = sys.argv[1]
    steam_bot = execute_function_single_row_return('get_steam_bot', steam_bot_id)
    steam_client = SteamClient()
    login_steam(steam_client, steam_bot)
    # Optionally, you can keep the process running if needed.
    _log("Steam login process completed.")
    
if __name__ == "__main__":
    main()
