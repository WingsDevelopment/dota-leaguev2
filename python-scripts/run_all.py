#!/usr/bin/env python3
import subprocess
import sys
import time
import os

def main():
    try:
        print("Starting Discord bot (main.py)...", flush=True)
        bot_process = subprocess.Popen([sys.executable, "main.py"])
    except Exception as e:
        print(f"Error starting main.py: {e}", flush=True)
        sys.exit(1)
        
    try:
        print("Starting login process (login.py)...", flush=True)
        # Pass steam_bot_id as argument; adjust as needed.
        login_process = subprocess.run([sys.executable, "login.py", "1"], check=True)
    except Exception as e:
        print(f"Error in login process: {e}", flush=True)
        bot_process.terminate()
        sys.exit(1)
    
    # Wait a moment after login to ensure state is maintained
    time.sleep(2)
    
    try:
        print("Starting lobby process (lobby.py)...", flush=True)
        # Pass game_id, steam_bot_id, league_id, game_mod, lobby_timeout (adjust values as needed)
        lobby_process = subprocess.Popen([sys.executable, "lobby.py", "3", "1", "17791", "16", "300"])
    except Exception as e:
        print(f"Error starting lobby.py: {e}", flush=True)
        bot_process.terminate()
        sys.exit(1)
        
    print("All processes started. Press Ctrl+C to stop.", flush=True)
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Terminating processes...", flush=True)
        lobby_process.terminate()
        bot_process.terminate()
        lobby_process.wait()
        bot_process.wait()
        print("All processes terminated.", flush=True)

if __name__ == "__main__":
    main()
