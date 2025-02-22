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
    
    # Wait a moment after login to ensure state is maintained
    time.sleep(2)
    
    try:
        print("Starting orchestrator process (lobby_orchestrator.py)...", flush=True)
        orchestrator_process = subprocess.Popen([sys.executable, "lobby_orchestrator.py"])
    except Exception as e:
        print(f"Error starting lobby_orchestrator.py: {e}", flush=True)
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
