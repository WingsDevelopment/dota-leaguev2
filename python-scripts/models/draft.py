from typing import Any, Dict, List
from random import choice
from discord import ButtonStyle, Interaction, Member, Embed, TextChannel
from discord.ui import View, Button
from discord.ext.commands import Context, Bot

import sys
sys.path.insert(0, '../')
import discord_db

RADIANT = 0
DIRE = 1
MAX_USERNAME_LENGTH = 15

class DraftView(View):
    def __init__(self, bot: Bot, replay_ctx: Context, players: List[Member], callback):
        super().__init__(timeout=None)
        self.bot = bot
        self.txt_channel: TextChannel = bot.draft_channel
        self.replay_ctx = replay_ctx
        self.callback = callback
        self.players = players
        self.lobby_size = len(players)
        self.giving_up_draft = False
        self.pick_phase = 0

        print("[DEBUG] Initializing DraftView with players:", [p.id for p in players])

        self._get_players_from_db()  # populates self.players with DB info
        self.drafters = self._select_captains()
        self.teams = {RADIANT: [], DIRE: []}
        _randteam = choice([0, 1])

        # The drafters are placed, one on each team
        self.teams[RADIANT].append(self.drafters[_randteam])
        self.teams[DIRE].append(self.drafters[1 - _randteam])

        # Initialize the dictionary of Discord UI Buttons
        self.buttons: Dict[str, Button] = {}
        self._set_buttons()

    async def button_callback(self, interaction: Interaction):
        # Decide who is allowed to pick
        drafter = interaction.user.id
        print(f"[DEBUG] button_callback invoked by user {drafter}")

        # Compare as strings to avoid type mismatches
        if str(drafter) != self.current_drafter['discord_id']:
            await self.txt_channel.send(f"It's <@{self.current_drafter['discord_id']}> turn to pick", delete_after=3)
            print("[DEBUG] Wrong drafter clicked the button.")
            return

        if interaction.data['custom_id'] == 'end_draft':
            # This handles toggling “swap drafter” logic
            self.giving_up_draft = not self.giving_up_draft
            # Inside button_callback, in the swap branch:
            if self.giving_up_draft:
                # Before swapping, check if there is at least one other member in the drafter’s team.
                team = self._get_drafters_team(self.current_drafter)
                if len(self.teams[team]) <= 1:
                    # No valid candidate to swap with; inform the user and cancel swap.
                    await self.txt_channel.send("Swap not possible: Only one member in your team.", delete_after=5)
                    self.giving_up_draft = False  # Reset swap flag.
                    return

                self.giving_up_draft = False
                index_original_drafter = self.drafters.index(self.current_drafter)
                # Use next with a default of None to avoid StopIteration.
                new_drafter = next(
                    filter(lambda player: str(player['id']) == str(interaction.data['custom_id']), self.teams[team]),
                    None
                )
                if new_drafter is None:
                    await self.txt_channel.send("Swap not possible: no valid candidate found.", delete_after=5)
                    return

                self.current_drafter = new_drafter
                self.drafters[index_original_drafter] = new_drafter
                self.clear_items()
                self._set_buttons()
                try:
                    await interaction.response.edit_message(embed=self.create_view_embed(), view=self)
                except Exception as e:
                    print("[DEBUG] error editing message on drafter swap:", e)
                return

            else:
                self._set_buttons()
                await self.txt_channel.send(f"You are now drafter again", delete_after=5)
            try:
                await interaction.response.edit_message(embed=self.create_view_embed(), view=self)
            except Exception as e:
                print("[DEBUG] error editing message on end_draft:", e)
            return

        drafter_team = self._get_drafters_team(self.current_drafter)
        if self.giving_up_draft:
            # We are swapping who the current drafter is
            self.giving_up_draft = False
            index_original_drafter = self.drafters.index(self.current_drafter)
            new_drafter = next(filter(lambda player: str(player['id']) == str(interaction.data['custom_id']), self.teams[drafter_team]))
            self.current_drafter = new_drafter
            self.drafters[index_original_drafter] = new_drafter
            self.clear_items()
            self._set_buttons()
            try:
                await interaction.response.edit_message(embed=self.create_view_embed(), view=self)
            except Exception as e:
                print("[DEBUG] error editing message on drafter swap:", e)
            return

        # Normal pick flow
        drafted_player = next(filter(lambda player: str(player['id']) == str(interaction.data['custom_id']), self.players))
        print(f"[DEBUG] Drafter {self.current_drafter['discord_id']} picked {drafted_player['discord_id']}")

        # Remove from the pool
        self.players.remove(drafted_player)
        self.buttons[str(drafted_player['id'])].disabled = True
        self.buttons[str(drafted_player['id'])].style = ButtonStyle.secondary
        self.teams[drafter_team].append(drafted_player)

        # If we’ve picked everyone, the draft is done
        if len(self.teams[RADIANT]) + len(self.teams[DIRE]) == self.lobby_size:
            self.clear_items()
            try:
                await interaction.response.edit_message(embed=self.create_view_embed(), view=self)
            except Exception as e:
                print("[DEBUG] error editing message on final pick:", e)
            # callback to proceed with the next stage, e.g. starting game
            await self.callback(self.replay_ctx, self._return_players_for_lobby())
            return

        # Otherwise, switch to the next drafter if needed
        if self.pick_phase in (0, 2, 4, 6, 7):
            self.current_drafter = self.teams[1 - drafter_team][0]
        self.pick_phase += 1

        try:
            await interaction.response.edit_message(embed=self.create_view_embed(), view=self)
        except Exception as e:
            print("[DEBUG] error editing message after pick:", e)

    def _get_drafters_team(self, drafter):
        # Ensure both IDs are compared as strings
        return RADIANT if str(drafter['discord_id']) == str(self.teams[RADIANT][0]['discord_id']) else DIRE

    def _select_captains(self):
        potential_captains = []
        for player in self.players:
            if player['captain'] == 1:
                potential_captains.append(player)

        if len(potential_captains) >= 2:
            potential_captains = sorted(potential_captains, key=lambda x: x['mmr'])
            # remove from the draft pool
            self.players.remove(potential_captains[-1])
            self.players.remove(potential_captains[-2])
            self.current_drafter = choice(potential_captains[-2:])
            print(f"[DEBUG] Two captains found, setting current_drafter to {self.current_drafter['discord_id']}")
            return potential_captains[-2:]
        elif len(potential_captains) == 1:
            # just one official captain, pick a second by mmr
            self.players.remove(potential_captains[0])
            max_mmr_player = max(self.players, key=lambda x: x['mmr'])
            potential_captains.append(max_mmr_player)
            self.players.remove(max_mmr_player)
            self.current_drafter = potential_captains[1]
            print(f"[DEBUG] One captain found, second is {max_mmr_player['discord_id']}, current_drafter is {self.current_drafter['discord_id']}")
            return potential_captains
        else:
            # no official captains, pick top 2 by mmr
            sorted_players = sorted(self.players, key=lambda x: x['mmr'])
            c1, c2 = sorted_players[-2:]
            # remove them from the pool
            self.players = sorted_players[0:-2]
            self.current_drafter = choice([c1, c2])
            print(f"[DEBUG] No captains, using top 2 mmr as captains {c1['discord_id']} & {c2['discord_id']}, current_drafter is {self.current_drafter['discord_id']}")
            return [c1, c2]

    def _return_players_for_lobby(self):
        # Tag each player with 'team' for the game-lobby usage
        lobby_players = []
        for player in self.teams[RADIANT]:
            player['team'] = RADIANT
            lobby_players.append(player)
        for player in self.teams[DIRE]:
            player['team'] = DIRE
            lobby_players.append(player)
        return lobby_players

    def create_view_embed(self):
        # Fill in mention name
        for player in self.players:
            player['discord_username'] = '<@' + str(player['discord_id']) + '>'

        current_drafter_name = self.current_drafter['discord_id']
        radiant_names = ['<@' + str(player['discord_id']) + '>' for player in self.teams[RADIANT]]
        dire_names = ['<@' + str(player['discord_id']) + '>' for player in self.teams[DIRE]]

        embed = Embed(title='Draft', color=0x00ff00)
        if len(self.players) > 0:
            embed.add_field(name='Player still in pool:', value="", inline=False)

        for index, player in enumerate(self.players, start=0):
            name = _get_embed_name(player)
            value = _get_embed_value(player)
            embed.add_field(name=name, value=value, inline=True)
            # Just to put a newline every two columns
            if index % 2 == 1 and index:
                embed.add_field(name="", value="", inline=False)

        embed.add_field(name="", value="", inline=False)
        embed.add_field(
            name='Radiant:',
            value='\n'.join(radiant_names) + '\n' * (6 - len(radiant_names)),
            inline=True
        )
        embed.add_field(
            name='Dire:',
            value='\n'.join(dire_names) + '\n' * (6 - len(dire_names)),
            inline=True
        )

        if len(self.players) > 0:
            embed.add_field(name='Current Drafter', value='<@' + str(current_drafter_name) + '>', inline=False)
            embed.set_footer(text='Click on the button with player name to draft them')

        return embed

    def _get_players_from_db(self) -> List[Any]:
        """
        Pulls player data from the DB by discord_id (as text),
        merges it with some stats in _add_stats_to_player.
        """
        players = []
        for p in self.players:
            # NOTE: p.id is an integer from Discord, so cast to str for DB call
            print(f"[DEBUG] Fetching from DB with discord_id=str({p.id})")
            player = discord_db.execute_function_single_row_return('get_player', str(p.id))
            # Set a fallback name
            if hasattr(p, 'display_name'):
                player['discord_username'] = p.display_name
                print(f"[DEBUG] Using Discord display name for discord_username: {p.display_name}")
            elif player.get('name'):
                # First fallback: Use the name from the DB record (if available)
                player['discord_username'] = player['name']
                print(f"[DEBUG] Using DB name for discord_username: {player['name']}")
            else:
                # fallback
                user = self.bot.get_user(p.id)
                if user:
                    player['discord_username'] = user.display_name
                    print(f"[DEBUG] Using bot-fetched user display name for discord_username: {user.display_name}")
                else:
                    player['discord_username'] = "UnknownMember"
                    print("[DEBUG] Defaulting discord_username to 'UnknownMember'")
            # Add more stats from DB
            _add_stats_to_player(player)
            players.append(player)
        self.players = players
        print("[DEBUG] Done _get_players_from_db => total players from DB:", len(players))

    def _set_buttons(self):
        """
        Creates a Button for each player in the pool
        plus the 'Swap Drafter' Button
        """
        for player in self.drafters:
            label = player['discord_username'][:MAX_USERNAME_LENGTH]
            self.buttons[str(player['id'])] = Button(
                style=ButtonStyle.blurple,
                label=label,
                custom_id=str(player['id'])
            )
            self.buttons[str(player['id'])].callback = self.button_callback

        for row, player in enumerate(self.players, start=0):
            label = player['discord_username'][:MAX_USERNAME_LENGTH]
            self.buttons[str(player['id'])] = Button(
                style=ButtonStyle.blurple,
                label=label,
                custom_id=str(player['id']),
                row=row // 4
            )
            self.buttons[str(player['id'])].callback = self.button_callback
            self.add_item(self.buttons[str(player['id'])])

        give_up_button = Button(
            style=ButtonStyle.red,
            label="Swap drafter",
            custom_id='end_draft',
            row=2
        )
        # If the team only has 1 person, we can’t swap
        if len(self.teams[self._get_drafters_team(self.current_drafter)]) == 1:
            give_up_button.disabled = True
        else:
            give_up_button.disabled = False
        give_up_button.callback = self.button_callback
        self.add_item(give_up_button)

    def _show_team_buttons(self, team):
        """
        Temporarily removes all buttons except for the teammates to pick as new drafter.
        """
        for player in self.teams[team]:
            label = player['discord_username'][:MAX_USERNAME_LENGTH]
            self.buttons[str(player['id'])] = Button(
                style=ButtonStyle.blurple,
                label=label,
                custom_id=str(player['id']),
                row=0
            )
            self.buttons[str(player['id'])].callback = self.button_callback
            self.add_item(self.buttons[str(player['id'])])

        give_up_button = Button(
            style=ButtonStyle.red,
            label="Cancel swap drafter",
            custom_id='end_draft',
            row=2
        )
        give_up_button.callback = self.button_callback
        self.add_item(give_up_button)

def _add_stats_to_player(player):
    # Check if the player ever played a game
    print(f"[DEBUG] _add_stats_to_player => Checking if {player['discord_id']} has played games")
    games_played = discord_db.execute_function_single_row_return('get_if_player_played_game', str(player['id']))
    if games_played['played'] == 0:
        player['wins'] = 0
        player['losses'] = 0
        player['rank'] = None
    else:
        rank_data = discord_db.execute_function_single_row_return('get_player_rank', str(player['id']))
        player['rank'] = rank_data['rank']
        wins_and_losses = discord_db.execute_function_single_row_return('get_players_wins_and_losses', str(player['id']))
        player['wins'] = wins_and_losses['wins']
        player['losses'] = wins_and_losses['losses']

    try:
        roles = discord_db.execute_function_with_return('get_player_role', str(player['id']))
        player['roles'] = [role['role'] for role in roles]
    except ValueError:
        player['roles'] = []
    return

def _get_embed_name(player):
    if player['rank']:
        return 'Rank: ' + str(player['rank'])
    else:
        return 'Unranked'

def _get_embed_value(player):
    if len(player['roles']) > 0:
        roles = ', '.join(str(role) for role in player['roles'])
        return f"<@{player['discord_id']}> \nWins: {player['wins']}\nLosses: {player['losses']}\nRoles: {roles}"
    else:
        return f"<@{player['discord_id']}> \nWins: {player['wins']}\nLosses: {player['losses']}\nRoles: not set"
