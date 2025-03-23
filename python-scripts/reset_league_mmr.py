#!/usr/bin/env python3
import sys
from discord_db import reset_all_player_mmr

def main():
    try:
        reset_all_player_mmr()
        print("reset_all_player_mmr deleted successfully.")
    except Exception as e:
        print("Error reset_all_player_mmr:", e)
        sys.exit(1)

if __name__ == "__main__":
    main()
