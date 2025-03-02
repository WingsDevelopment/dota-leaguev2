import unittest
import logging
from utility import balanced_shuffle, RADINANT, DIRE


def test_balanced_shuffle_even_unique():
    # Create 10 unique players (5 vs 5)
    players = [{'id': i, 'mmr': 1000 + i} for i in range(10)]
    balanced_shuffle(players)
    team0 = [p for p in players if p['team'] == 0]
    team1 = [p for p in players if p['team'] == 1]
    assert len(team0) == 5 and len(team1) == 5, "Teams not balanced correctly"
    print("Test even unique passed.")

def test_balanced_shuffle_odd():
    # Create 9 players, which is odd
    players = [{'id': i, 'mmr': 1000 + i} for i in range(9)]
    try:
        balanced_shuffle(players)
    except ValueError as e:
        assert "even" in str(e)
        print("Test odd number passed.")
    else:
        assert False, "Error not raised for odd number of players."

def test_balanced_shuffle_duplicate():
    # Create a list with duplicate players
    players = [
        {'id': 1, 'mmr': 1000},
        {'id': 1, 'mmr': 1020},
        {'id': 2, 'mmr': 1010},
        {'id': 3, 'mmr': 1005}
    ]
    try:
        balanced_shuffle(players)
    except ValueError as e:
        assert "Duplicate" in str(e)
        print("Test duplicate players passed.")
    else:
        assert False, "Error not raised for duplicate players."

if __name__ == '__main__':
    test_balanced_shuffle_even_unique()
    test_balanced_shuffle_odd()
    test_balanced_shuffle_duplicate()
    print("All tests passed.")
