from typing import Any, Dict, List
from random import choice
from discord import ButtonStyle, Interaction, Member, Embed, TextChannel
from discord.ui import View, Button
from discord.ext.commands import Context, Bot

from discord_db import execute_function_single_row_return, execute_function_with_return

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

        self._get_players_from_db()
        self.drafters = self._select_captains()
        self.teams = {RADIANT: [], DIRE: []}
        _randteam = choice([0, 1])
        self.teams[RADIANT].append(self.drafters[_randteam])
        self.teams[DIRE].append(self.drafters[1 - _randteam])
        self.buttons: Dict[str, Button] = {}
        self._set_buttons()

    async def button_callback(self, interaction: Interaction):
        drafter = interaction.user.id
        if drafter != self.current_drafter['discord_id']:
            await self.txt_channel.send(f"It's <@{self.current_drafter['discord_id']}> turn to pick", delete_after=3)
            return

        if interaction.data['custom_id'] == 'end_draft':
            self.giving_up_draft = not self.giving_up_draft
            if self.giving_up_draft:
                self.clear_items()
                self._show_team_buttons(self._get_drafters_team(self.current_drafter))
                await self.txt_channel.send(f"You gave up being drafter, pick a new drafter from your team", delete_after=10)
            else:
                self._set_buttons()
                await self.txt_channel.send(f"You are now drafter again", delete_after=5)
            try:
                await interaction.response.edit_message(embed=self.create_view_embed(), view=self)
            except Exception as e:
                pass
            return

        drafter_team = self._get_drafters_team(self.current_drafter)
        if self.giving_up_draft:
            self.giving_up_draft = False
            index_original_drafter = self.drafters.index(self.current_drafter)
            self.current_drafter = list(filter(lambda player: str(player['id']) == interaction.data['custom_id'], self.teams[drafter_team]))[0]
            self.drafters[index_original_drafter] = self.current_drafter
            self.clear_items()
            self._set_buttons()
            try:
                await interaction.response.edit_message(embed=self.create_view_embed(), view=self)
            except Exception as e:
                pass
            return

        drafted_player = list(filter(lambda player: str(player['id']) == interaction.data['custom_id'], self.players))[0]
        self.players.remove(drafted_player)
        self.buttons[str(drafted_player['id'])].disabled = True
        self.buttons[str(drafted_player['id'])].style = ButtonStyle.secondary
        self.teams[drafter_team].append(drafted_player)

        if len(self.teams[0]) + len(self.teams[1]) == self.lobby_size:
            self.clear_items()
            try:
                await interaction.response.edit_message(embed=self.create_view_embed(), view=self)
            except Exception as e:
                pass
            await self.callback(self.replay_ctx, self._return_players_for_lobby())
            return

        if self.pick_phase in (0, 2, 4, 6, 7):
            self.current_drafter = self.teams[1 - drafter_team][0]
        self.pick_phase += 1
        try:
            await interaction.response.edit_message(embed=self.create_view_embed(), view=self)
        except Exception as e:
            pass

    def _get_drafters_team(self, drafter):
        return RADIANT if drafter['discord_id'] == self.teams[RADIANT][0]['discord_id'] else DIRE

    def _select_captains(self):
        potential_captains = []
        for player in self.players:
            if player['captain'] == 1:
                potential_captains.append(player)
        if len(potential_captains) >= 2:
            potential_captains = sorted(potential_captains, key=lambda x: x['mmr'])
            self.players.remove(potential_captains[-1])
            self.players.remove(potential_captains[-2])
            self.current_drafter = choice(potential_captains[-2:])
            return potential_captains[-2:]
        elif len(potential_captains) == 1:
            self.players.remove(potential_captains[0])
            max_mmr_player = max(self.players, key=lambda x: x['mmr'])
            potential_captains.append(max_mmr_player)
            self.players.remove(max_mmr_player)
            self.current_drafter = potential_captains[1]
            return potential_captains
        else:
            sorted_players = sorted(self.players, key=lambda x: x['mmr'])
            self.players = sorted_players[0:-2]
            self.current_drafter = choice(sorted_players[-2:])
            return sorted_players[-2:]
    
    def _return_players_for_lobby(self):
        lobby_players = []
        for player in self.teams[RADIANT]:
            player['team'] = 0
            lobby_players.append(player)
        for player in self.teams[DIRE]:
            player['team'] = 1
            lobby_players.append(player)
        return lobby_players
    
    def create_view_embed(self):
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
            if index % 2 == 1 and index:
                embed.add_field(name="", value="", inline=False)
        embed.add_field(name="", value="", inline=False)
        embed.add_field(name='Radiant:', value='\n'.join(radiant_names) + '\n' * (6 - len(radiant_names)), inline=True)
        embed.add_field(name='Dire:', value='\n'.join(dire_names) + '\n' * (6 - len(dire_names)), inline=True)
        if len(self.players) > 0:
            embed.add_field(name='Current Drafter', value='<@' + str(current_drafter_name) + '>', inline=False)
            embed.set_footer(text='Click on the button with player name to draft them')
        return embed
    
    def _get_players_from_db(self) -> List[Any]:
        players = []
        for p in self.players:
            player = execute_function_single_row_return('get_player', p.id)  # player.id is discord_id
            if hasattr(p, 'display_name'):
                player['discord_username'] = p.display_name
            else:
                player['discord_username'] = self.bot.get_user(p.id).display_name
            _add_stats_to_player(player)  # add more stats to player
            players.append(player)
        self.players = players
    
    def _set_buttons(self):
        for player in self.drafters:
            label = player['discord_username'][:MAX_USERNAME_LENGTH]
            self.buttons[str(player['id'])] = Button(style=ButtonStyle.blurple, label=label, custom_id=str(player['id']))
            self.buttons[str(player['id'])].callback = self.button_callback
            
        for row, player in enumerate(self.players, start=0):
            label = player['discord_username'][:MAX_USERNAME_LENGTH]
            self.buttons[str(player['id'])] = Button(style=ButtonStyle.blurple, label=label, custom_id=str(player['id']), row=row // 4)
            self.buttons[str(player['id'])].callback = self.button_callback
            self.add_item(self.buttons[str(player['id'])])
        
        give_up_button = Button(style=ButtonStyle.red, label="Swap drafter", custom_id='end_draft', row=2)
        give_up_button.callback = self.button_callback
        if len(self.teams[self._get_drafters_team(self.current_drafter)]) == 1:
            give_up_button.disabled = True
        else:
            give_up_button.disabled = False
        self.add_item(give_up_button)
    
    def _show_team_buttons(self, team):
        for player in self.teams[team]:
            label = player['discord_username'][:MAX_USERNAME_LENGTH]
            self.buttons[str(player['id'])] = Button(style=ButtonStyle.blurple, label=label, custom_id=str(player['id']), row=0)
            self.buttons[str(player['id'])].callback = self.button_callback
            self.add_item(self.buttons[str(player['id'])])
        give_up_button = Button(style=ButtonStyle.red, label="Cancel swap drafter", custom_id='end_draft', row=2)
        give_up_button.callback = self.button_callback
        self.add_item(give_up_button)

def _add_stats_to_player(player):
    games_played = execute_function_single_row_return('get_if_player_played_game', player['id'])
    if games_played['played'] == 0:
        player['wins'] = 0
        player['losses'] = 0
        player['rank'] = None
    else:
        player['rank'] = execute_function_single_row_return('get_player_rank', player['id'])['rank']
        wins_and_losses = execute_function_single_row_return('get_players_wins_and_losses', player['id'])
        player['wins'] = wins_and_losses['wins']
        player['losses'] = wins_and_losses['losses']
    try:
        roles = execute_function_with_return('get_player_role', player['id'])
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
