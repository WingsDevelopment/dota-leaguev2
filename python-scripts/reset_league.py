#!/usr/bin/env python3
import sys
from discord_db import reset_league

def main():
    try:
        reset_league()
        print("All games deleted successfully.")
    except Exception as e:
        print("Error deleting games:", e)
        sys.exit(1)

if __name__ == "__main__":
    main()
