import itertools
import random
import string
from typing import List

ID = 0
MMR = 1
RADINANT = 0
DIRE = 1

SUFFICIENT_NUMBER_OF_RESULTS_FOUND = 3

def get_random_password(n=8):
    return ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(n))


def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d


def balanced_shuffle(players) -> None:
    min_diff = float('inf')
    team_size = len(players) // 2
    result = ()
    result_list = []

    player_ids = [(player['id'], player['mmr']) for player in players]
    # Generate all possible combinations of dividing the players
    for comb in itertools.combinations(player_ids, team_size):
        set1 = set(comb)
        set2 = set(player_ids) - set1

        sum1 = sum(player[MMR] for player in set1)
        sum2 = sum(player[MMR] for player in set2)
        diff = abs(sum1 - sum2)

        # Update minimum difference and result if necessary
        if diff < min_diff:
            min_diff = diff
            result = set1, set2

        if diff < 25:
            result_list.append((set1, set2))
            if len(result_list) == SUFFICIENT_NUMBER_OF_RESULTS_FOUND:
                break # We have enough results, no need to continue

    team = random.randint(RADINANT, DIRE)
    shuffle_mod = len(result_list) < SUFFICIENT_NUMBER_OF_RESULTS_FOUND
    result = result if shuffle_mod else random.choice(result_list)
    player_ids_radiant = [p[ID] for p in result[RADINANT]]
    #player_ids_dire = [p[ID] for p in result[DIRE]]

    for player in players:
        if player['id'] in player_ids_radiant:
            player['team'] = team
        else:
            player['team'] = 1 - team

def split_digits(num : int) -> List[int]:
    digits = []
    for digit_char in str(num):
        digits.append(int(digit_char))
    return digits

def calculate_elo(radiant_elo: float, dire_elo: float, result) -> str:
    """
    Calculates the new ELO rating for two teams based on the result of a match.
    radiant_elo: The current ELO rating of team 1.
    dire_elo: The current ELO rating of team 2.
    result: The result of the match, either 1 for player 1 winning or -1 for player 2 winning.
    Returns a change in absolute change in mmr.
    """
    k = 50  # The K-factor determines how much the ELO ratings change after a match.
    expected_score_radiant = 1 / (1 + 10 ** ((dire_elo - radiant_elo) / 400))
    # Convert result to a score between 0 and 1.
    actual_score_radiant = (result + 1) / 2
    if radiant_elo == dire_elo:
        # Both teams have equal ELO ratings and the result is not a draw.
        # The winning team receives 25 points.
        if result == 1:
            actual_score_radiant = 1
        else:
            actual_score_radiant = 0
    elo_change = k * (actual_score_radiant - expected_score_radiant)
    return str(round(abs(elo_change)))
