
@commands.has_role(ADMIN_ROLE)
@bot.hybrid_command("score", description="Score a match (autoscorematch)")
async def score(ctx: Context, steam_match_id: str):
    match_id = steam_match_id
    _log("AutoscoreMatch command invoked")
    try:
        await asyncio.wait_for(autoscore_lock.acquire(), timeout=0.01)
    except asyncio.TimeoutError:
        await ctx.reply("AutoscoreMatch already in progress", delete_after=10)
        return

    try:
        # Ensure league id is set.
        if LEAGUE_ID == 0:
            await ctx.reply('League id not set. AutoscoreMatch cannot be used', delete_after=10)
            return

        _log(f"Retrieving match history for league ID {LEAGUE_ID}...")
        matches = api.get_match_history(league_id=LEAGUE_ID)
        _log("Match history retrieved!")

        if not matches['matches']:
            await ctx.reply(f'No matches found in a league with id {LEAGUE_ID}', delete_after=10)
            return

        # Find the match in match history.
        match = next((m for m in matches['matches'] if str(m['match_id']) == match_id), None)
        if match is None:
            _log(f"Match {match_id} not found in match history. Proceeding with empty player list.")
            match = {"match_id": match_id, "players": []}

        # Retrieve active games and map game_id to their players.
        try:
            active_games = execute_function_with_return('get_active_games')
        except ValueError:
            active_games = []
        active_game_players_dict = {}
        for game in active_games:
            players_in_game = execute_function_with_return('get_all_players_from_game', game['id'])
            active_game_players_dict[game['id']] = [
                (int(player['steam_id']), player['team']) for player in players_in_game
            ]
            _log(f"Active game {game['id']} has players: {active_game_players_dict[game['id']]}")

        # Build player list from match info.
        match_players = []
        for player in match.get('players', []):
            team = 0 if player.get('side') == 'radiant' else 1
            steam_id = player.get('steam_account', {}).get('id64')
            if steam_id is not None:
                match_players.append((steam_id, team))
        _log(f"Match players from match history: {match_players}")

        # Compare match players with active games.
        matching_games = []
        for game_id_key, game_players in active_game_players_dict.items():
            if set(game_players) == set(match_players):
                matching_games.append(game_id_key)
        if matching_games:
            game_id_used = matching_games[0]
            _log(f"Found matching active game {game_id_used} for match {match_id}")
            # Check for missing players and add them.
            existing_players = execute_function_with_return('get_all_players_from_game', game_id_used)
            existing_tuples = {(int(p['steam_id']), p['team']) for p in existing_players}
            for steam_id, team in match_players:
                if (int(steam_id), team) not in existing_tuples:
                    try:
                        player_record = execute_function_single_row_return('get_player_by_steam', steam_id)
                        player_id = player_record['id']
                        execute_function_no_return('add_player_to_game', game_id_used, player_id, team)
                        _log(f"Added missing player {steam_id} to game {game_id_used}")
                    except ValueError:
                        _log(f"Player with steam_id {steam_id} not found in database. Skipping.", level="ERROR")
        else:
            _log("No matching active game found; creating a new game record.")
            game_id_used = execute_insert_and_return_id('add_game', 'DRAFT')
            lobby_name = GAME_NAME + str(game_id_used)
            lobby_password = get_random_password()
            execute_function_no_return('add_game_args', game_id_used, lobby_name, lobby_password)
            # Build a players_for_lobby list by looking up internal records.
            players_for_lobby = []
            for steam_id, team in match_players:
                try:
                    player_record = execute_function_single_row_return('get_player_by_steam', steam_id)
                    players_for_lobby.append((player_record, team))
                except ValueError:
                    _log(f"Player with steam_id {steam_id} not found in database. Skipping.", level="ERROR")
            for player_record, team in players_for_lobby:
                execute_function_no_return('add_player_to_game', game_id_used, player_record['id'], team)

        # Check if this match has already been processed.
        try:
            scored_games = execute_function_with_return('get_scored_games_with_steam_match_id')
            processed_ids = [str(game['steam_match_id']) for game in scored_games]
        except ValueError:
            processed_ids = []
        if match_id in processed_ids:
            await ctx.reply(f"Match with id {match_id} has already been processed", delete_after=10)
            return

        # Determine winning team using the OpenDota API helper.
        winner = get_match_winner(match_id)
        _log(f"Winner for match {match_id}: {winner}")
        if winner not in ['radiant', 'dire']:
            await ctx.reply(f"Could not determine winner for match {match_id}", delete_after=10)
            return
        result = 0 if winner == 'radiant' else 1

        # Score the game record: update status to 'OVER' and record the match id.
        execute_function_no_return('score_game', game_id_used, result, match_id)
        _log(f"Game {game_id_used} scored with result {winner} for match {match_id}")

        # Retrieve players from the game to update Elo ratings.
        game_players = execute_function_with_return('get_all_players_from_game', game_id_used)
        team_zero = [p['mmr'] for p in game_players if p['team'] == 0]
        team_one = [p['mmr'] for p in game_players if p['team'] == 1]
        team_zero_avg = round(sum(team_zero)/len(team_zero)) if team_zero else 0
        team_one_avg = round(sum(team_one)/len(team_one)) if team_one else 0
        if team_zero and team_one:
            elo_change = calculate_elo(team_zero_avg, team_one_avg, 1 if result == 0 else -1)
        else:
            elo_change = 25  # Default value if one team is empty (e.g. during testing)
        for player in game_players:
            if player['team'] == result:
                execute_function_no_return('update_player_mmr_won', player['id'], elo_change)
            else:
                execute_function_no_return('update_player_mmr_lost', player['id'], elo_change)

        # Fetch detailed match info and store match history.
        try:
            match_details = get_match_info(match_id)
            store_match_history(match_details, LEAGUE_ID, match.get('players', []))
            _log(f"Stored match history for match {match_id}")
        except Exception as e:
            _log(f"Error storing match history for match {match_id}: {e}", level="ERROR")

        await ctx.reply(f"Match {match_id} autoscored successfully with winner {winner}")
    except Exception as e:
        await ctx.reply(f"AutoscoreMatch encountered an error: {e}", delete_after=10)
    finally:
        _log("Unlocking autoscorematch lock...")
        autoscore_lock.release()