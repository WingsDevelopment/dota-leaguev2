import datetime
from typing import Any, Dict, List
from random import choice
from discord import ButtonStyle, Interaction, TextChannel
from discord.ui import View, Button

from discord_db import execute_function_single_row_return

class ConsoleView(View):
    def __init__(self, bot, RENDER, callback_normal, callback_draft):
        super().__init__(timeout=None)
        self.bot = bot
        self.console_channel: TextChannel = bot.console_channel
        self.callback_normal = callback_normal
        self.callback_draft = callback_draft
        self.RENDER = RENDER
        
        self.signup_draft_button = Button(style=ButtonStyle.green, label="Draft game signup", custom_id="2")
        self.signup_draft_button.callback = self.signup_draft_callback
        self.add_item(self.signup_draft_button)
        
        self.signup_button = Button(style=ButtonStyle.blurple, label="Normal game signup", custom_id="1")
        self.signup_button.callback = self.signup_callback
        self.add_item(self.signup_button)
        
        self.leave_button = Button(style=ButtonStyle.red, label="Leave all queues", custom_id="3")
        self.leave_button.callback = self.leave_callback
        self.add_item(self.leave_button)

    async def signup_callback(self, interaction: Interaction):
        user = interaction.user
        try:
            execute_function_single_row_return('get_player_id', interaction.user.id)
            player = execute_function_single_row_return("get_player", interaction.user.id)
            banned_until_str = player.get('banned_until')
            if banned_until_str:
                try:
                    banned_until = datetime.datetime.fromisoformat(banned_until_str)  # Convert only if not None
                    if banned_until > datetime.datetime.now():
                        await interaction.response.send_message(f'You are banned until {banned_until}', delete_after=10)
                        return
                except ValueError:
                    print(f"Warning: Invalid date format in banned_until for {interaction.user.id}: {banned_until_str}")
        except ValueError:
            await self.console_channel.send(f'<@{user.id}> You need to signup for the leage', delete_after=5)
            return
        if user not in self.bot.sigedUpPlayerPool:  # type: ignore
            self.bot.sigedUpPlayerPool.append(user)  # type: ignore
            await self.console_channel.send(f'<@{user.id}> You successfully signed up for a game', delete_after=5)
            self.RENDER['queue'] = True
            await self.callback_normal(None)
        else:
            await self.console_channel.send(f'<@{user.id}> You have already signed up for the game', delete_after=5)
        try:
            await interaction.response.edit_message(view=self)
        except Exception as e:
            # Optionally log the exception here
            pass

    async def signup_draft_callback(self, interaction: Interaction):
        user = interaction.user
        try:
            execute_function_single_row_return('get_player_id', interaction.user.id)
            player = execute_function_single_row_return("get_player", interaction.user.id)
            banned_until_str = player.get('banned_until')
            if banned_until_str:
                try:
                    banned_until = datetime.datetime.fromisoformat(banned_until_str)  # Convert only if not None
                    if banned_until > datetime.datetime.now():
                        await interaction.response.send_message(f'You are banned until {banned_until}', delete_after=10)
                        return
                except ValueError:
                    print(f"Warning: Invalid date format in banned_until for {interaction.user.id}: {banned_until_str}")
        except ValueError:
            await self.console_channel.send(f'<@{user.id}> You need to signup for the leage', delete_after=5)
            return
        if not any(member.id == user.id for member in self.bot.sigedUpDraftPlayerPool):  # type: ignore
            self.bot.sigedUpDraftPlayerPool.append(user)  # type: ignore
            await self.console_channel.send(f'<@{user.id}> You successfully signed up for a draft game', delete_after=5)
            self.RENDER['queue_draft'] = True
            await self.callback_draft(None)
        else:
            await self.console_channel.send(f'<@{user.id}> You have already signed up for the draft game', delete_after=5)
        try:
            await interaction.response.edit_message(view=self)
        except Exception as e:
            pass

    async def leave_callback(self, interaction: Interaction):
        user = interaction.user  # type: ignore
        player_to_remove_from_queue = next((member for member in self.bot.sigedUpPlayerPool if member.id == interaction.user.id), None)
        player_to_remove_from_draft_queue = next((member for member in self.bot.sigedUpDraftPlayerPool if member.id == interaction.user.id), None)
        if player_to_remove_from_queue is None and player_to_remove_from_draft_queue is None:  # type: ignore
            await self.console_channel.send(f'<@{user.id}> You are not in the queue', delete_after=5)
            return
        if player_to_remove_from_queue:
            self.bot.sigedUpPlayerPool.remove(player_to_remove_from_queue)
        if player_to_remove_from_draft_queue:
            self.bot.sigedUpDraftPlayerPool.remove(player_to_remove_from_draft_queue)
        await self.console_channel.send(f'<@{user.id}> You left the queue', delete_after=5)
        self.RENDER['queue'] = True
        self.RENDER['queue_draft'] = True
        try:
            await interaction.response.edit_message(view=self)
        except Exception as e:
            pass
