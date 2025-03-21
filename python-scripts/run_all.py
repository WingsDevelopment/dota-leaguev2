#!/usr/bin/env python3
import subprocess
import sys
import time
import os

def main():
    dev_arg = []
    if len(sys.argv) > 1 and sys.argv[1] == 'dev':
        dev_arg = ['dev']

    # Run database migrations first.
    try:
        print("Running database migrations...", flush=True)
        subprocess.run([sys.executable, "migrate_db.py"] + dev_arg, check=True)
        print("Database migrations completed successfully.", flush=True)
    except subprocess.CalledProcessError as e:
        print(f"Error running migrate_db.py: {e}", flush=True)
        sys.exit(1)
    
    # Start the Discord bot.
    try:
        print("Starting Discord bot (main.py)...", flush=True)
        bot_process = subprocess.Popen([sys.executable, "main.py"] + dev_arg)
    except Exception as e:
        print(f"Error starting main.py: {e}", flush=True)
        sys.exit(1)
    
    time.sleep(2)
    
    # Start the orchestrator process.
    try:
        print("Starting orchestrator process (lobby_orchestrator.py)...", flush=True)
        orchestrator_process = subprocess.Popen([sys.executable, "lobby_orchestrator.py"] + dev_arg)
    except Exception as e:
        print(f"Error starting lobby_orchestrator.py: {e}", flush=True)
        bot_process.terminate()
        sys.exit(1)
    
    # Reinitialize bot accounts.
    try:
        print("Reinitializing bot accounts...", flush=True)
        subprocess.run([sys.executable, "reinitialize_all_bots.py"] + dev_arg, check=True)
        print("Bot accounts reinitialized successfully.", flush=True)
    except subprocess.CalledProcessError as e:
        print(f"Error running reinitialize_all_bots.py: {e}", flush=True)
        orchestrator_process.terminate()
        bot_process.terminate()
        sys.exit(1)
        
    print("All processes started. Press Ctrl+C to stop.", flush=True)
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Terminating processes...", flush=True)
        orchestrator_process.terminate()
        bot_process.terminate()
        orchestrator_process.wait()
        bot_process.wait()
        print("All processes terminated.", flush=True)

if __name__ == "__main__":
    main()
