import datetime
from typing import Any, Optional
from discord import ButtonStyle, Interaction, TextChannel
from discord.ui import View, Button
from discord_db import execute_function_single_row_return
from queues_config import QUEUES

class ConsoleView(View):
    def __init__(self, bot, RENDER):
        super().__init__(timeout=None)
        self.bot = bot
        self.RENDER = RENDER
        self.console_channel: TextChannel = bot.console_channel

        # Dynamically create a button for each queue
        for idx, q in enumerate(QUEUES, start=1):
            btn = Button(style=q.style, label=q.label, custom_id=str(idx))
            async def _cb(interaction: Interaction, q=q):
                await self.generic_signup(interaction, q)
            btn.callback = _cb
            self.add_item(btn)

        # Leave button
        leave_btn = Button(style=ButtonStyle.red, label="Leave all queues", custom_id="leave")
        leave_btn.callback = self.leave_callback
        self.add_item(leave_btn)

    async def generic_signup(self, interaction: Interaction, q):
        user = interaction.user

        # 1) Registration & ban logic
        try:
            execute_function_single_row_return('get_player_id', user.id)
            player = execute_function_single_row_return('get_player', user.id)
            banned_until_str = player.get('banned_until')
            if banned_until_str:
                try:
                    banned_until = datetime.datetime.fromisoformat(banned_until_str)
                    if banned_until > datetime.datetime.now():
                        await interaction.response.send_message(
                            f"You are banned until {banned_until}", delete_after=10
                        )
                        return
                except ValueError:
                    print(f"Warning: invalid banned_until format: {banned_until_str}")
        except ValueError:
            await interaction.response.send_message(
                f"<@{user.id}> You need to signup for the league", delete_after=5
            )
            return

        # 2) Custom validation, if defined
        if q.validation_fn_name:
            validator = getattr(self, q.validation_fn_name)
            ok, reason = await validator(user)
            if not ok:
                await interaction.response.send_message(reason, delete_after=10)
                return

        # 3) Add user to the appropriate pool
        pool: list = getattr(self.bot, q.pool_attr)
        if any(m.id == user.id for m in pool):
            await interaction.response.send_message(
                f"<@{user.id}> You have already signed up for {q.label}", delete_after=5
            )
            return

        pool.append(user)
        self.RENDER[q.key] = True

        # 4) Trigger the start-if-full handler in main module
        import __main__ as main
        await getattr(main, q.start_fn_name)(None)

        # 5) Update the view and send confirmation
        await interaction.response.edit_message(view=self)
        await self.console_channel.send(
            f"<@{user.id}> You successfully signed up for {q.label}", delete_after=5
        )

    async def leave_callback(self, interaction: Interaction):
        user = interaction.user
        removed = False
        # Remove from every pool
        for q in QUEUES:
            pool: list = getattr(self.bot, q.pool_attr)
            member = next((m for m in pool if m.id == user.id), None)
            if member:
                pool.remove(member)
                self.RENDER[q.key] = True
                removed = True

        if not removed:
            await interaction.response.send_message(
                f"<@{user.id}> You are not in any queue", delete_after=5
            )
            return

        # Trigger re-render of buttons if needed
        import __main__ as main
        await main._rerender_queue_console_if_needed()

        # Update the view and send confirmation
        await interaction.response.edit_message(view=self)
        await self.console_channel.send(
            f"<@{user.id}> You left all queues", delete_after=5
        )

    # --- Custom validators for high MMR queues ---
    async def validate_high_mmr(self, user: Any) -> tuple[bool, Optional[str]]:
        player = execute_function_single_row_return('get_player', user.id)
        vouches = player.get('queue_vouches', []) or []
        if "5" not in vouches:
            return False, f"Sorry <@{user.id}> you are not vouched for this queue. Try supreme or ping admins."
        return True, None

    async def validate_high_mmr_balance(self, user: Any) -> tuple[bool, Optional[str]]:
        player = execute_function_single_row_return('get_player', user.id)
        vouches = player.get('queue_vouches', []) or []
        if "5" not in vouches:
            return False, f"Sorry <@{user.id}> you are not vouched for this queue. Try supreme or ping admins."
        return True, None
