import asyncio
from random import choice
from draft import DraftView, RADIANT, DIRE

import sys
sys.path.insert(0, '../')
from discord_db import execute_function_single_row_return, execute_function_with_return

# Dummy classes to simulate Discord objects
class DummyMember:
    def __init__(self, id, display_name=None):
        self.id = id
        self.display_name = display_name if display_name else f"User{id}"

class DummyTextChannel:
    async def send(self, content, delete_after=None):
        print(f"TextChannel message: {content}")

class DummyResponse:
    async def edit_message(self, embed=None, view=None):
        # Simulate the edit message call
        return

class DummyInteraction:
    def __init__(self, user, custom_id):
        self.user = user
        self.data = {'custom_id': custom_id}
        self.response = DummyResponse()

class DummyBot:
    def __init__(self):
        self.draft_channel = DummyTextChannel()
        self.users = {}
    def get_user(self, id):
        return self.users.get(id, DummyMember(id))

class DummyContext:
    pass

# Fake DB functions to simulate data retrieval
def fake_execute_function_single_row_return(function_name, id):
    id_int = int(id)
    if function_name == 'get_player':
        # Mark players 1 and 2 as captains, others are not
        return {
            'id': id_int,
            'discord_id': id_int,
            'captain': 1 if id_int in (1, 2) else 0,
            'mmr': 1000 + id_int * 10,
            'wins': 0,
            'losses': 0,
            'discord_username': f"User{id}",
            'roles': []
        }
    elif function_name == 'get_if_player_played_game':
        return {'played': 0}
    elif function_name == 'get_player_rank':
        return {'rank': 1}
    elif function_name == 'get_players_wins_and_losses':
        return {'wins': 0, 'losses': 0}
    else:
        return {}

def fake_execute_function_with_return(function_name, id):
    if function_name == 'get_player_role':
        return []
    return []

import discord_db
discord_db.execute_function_single_row_return = fake_execute_function_single_row_return
discord_db.execute_function_with_return = fake_execute_function_with_return

# Global variable to capture the final lobby outcome
final_lobby = []

# Dummy callback that prints and stores the final lobby
async def dummy_callback(ctx, lobby_players):
    global final_lobby
    final_lobby = lobby_players
    print("Draft complete. Final lobby:")
    for p in lobby_players:
        team = "Radiant" if p.get('team') == RADIANT else "Dire"
        print(f"Player {p['discord_id']} assigned to {team}")

# Test function for a given set of dummy players
async def run_draft_test(dummy_players, description=""):
    global final_lobby
    final_lobby = []  # reset before each test

    print("\n---", description, "---")
    bot = DummyBot()
    for player in dummy_players:
        bot.users[player.id] = player
    dummy_ctx = DummyContext()

    draft_view = DraftView(bot=bot, replay_ctx=dummy_ctx, players=dummy_players, callback=dummy_callback)
    
    total_picks = 0
    # Continue until the sum of players in both teams equals the lobby size
    while len(draft_view.teams[RADIANT]) + len(draft_view.teams[DIRE]) < draft_view.lobby_size:
        current_drafter_id = draft_view.current_drafter['discord_id']
        if not draft_view.players:
            break  # No more players in the pool
        drafted_player = draft_view.players[0]
        print(f"Simulating pick: Current drafter {current_drafter_id} picks player {drafted_player['discord_id']}")
        dummy_interaction = DummyInteraction(user=DummyMember(current_drafter_id), custom_id=str(drafted_player['id']))
        await draft_view.button_callback(dummy_interaction)
        total_picks += 1
        await asyncio.sleep(0.05)
    
    print("Total picks simulated:", total_picks)
    print("Final draft teams:")
    for p in final_lobby:
        team = "Radiant" if p.get('team') == RADIANT else "Dire"
        print(f"Player {p['discord_id']} -> {team}")

# Main test runner
async def main_tests():
    # Test 1: Standard 10-player draft
    dummy_players_10 = [DummyMember(id=i, display_name=f"User{i}") for i in range(1, 11)]
    await run_draft_test(dummy_players_10, "10-Player Draft Test")

    # Test 2: Edge case with 4 players (should form teams of 2 each)
    dummy_players_4 = [DummyMember(id=i, display_name=f"User{i}") for i in range(11, 15)]
    await run_draft_test(dummy_players_4, "4-Player Draft Test")
    
    # Test 3: Test the swap drafter functionality
    # Initialize with 10 players, then simulate a swap by invoking the 'end_draft' button.
    dummy_players_swap = [DummyMember(id=i, display_name=f"User{i}") for i in range(21, 31)]
    bot = DummyBot()
    for player in dummy_players_swap:
        bot.users[player.id] = player
    dummy_ctx = DummyContext()
    draft_view = DraftView(bot=bot, replay_ctx=dummy_ctx, players=dummy_players_swap, callback=dummy_callback)
    
    # Simulate a swap request from the current drafter:
    current_drafter_id = draft_view.current_drafter['discord_id']
    print(f"\nSimulating swap drafter: current drafter {current_drafter_id} triggers swap.")
    dummy_swap_interaction = DummyInteraction(user=DummyMember(current_drafter_id), custom_id='end_draft')
    await draft_view.button_callback(dummy_swap_interaction)
    
    # Now simulate the new drafter picking a player
    if draft_view.players:
        new_drafter_id = draft_view.current_drafter['discord_id']
        drafted_player = draft_view.players[0]
        print(f"After swap, drafter {new_drafter_id} picks player {drafted_player['discord_id']}")
        dummy_interaction = DummyInteraction(user=DummyMember(new_drafter_id), custom_id=str(drafted_player['id']))
        await draft_view.button_callback(dummy_interaction)
    else:
        print("No players left to pick after swap.")

# Run all tests
if __name__ == '__main__':
    asyncio.run(main_tests())
