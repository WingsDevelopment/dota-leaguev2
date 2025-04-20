"use client";

import { useState, useEffect } from "react";
import PlayerCrud from "@/components/admin/player-crud";
import { apiCallerGetPlayers } from "@/app/api/player/players-read/caller";
import { Player } from "@/app/services/playerService/getPlayerBySteamId";

export default function PlayersPage() {
  const [playerList, setPlayerList] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiCallerGetPlayers()
      .then((data) => setPlayerList(data))
      .catch((err) => {
        console.error(err);
        setError("Failed to load players");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading players…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="flex flex-col gap-4">
      <PlayerCrud playerList={playerList} />
    </div>
  );
}
