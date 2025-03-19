"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DIRE, RADIANT } from "../../app/common/constraints";

type GameStatus =
  | "PREGAME"
  | "HOSTED"
  | "STARTED"
  | "OVER"
  | "ABORTED"
  | "CANCEL"
  | "REHOST";
type GameType = "DRAFT" | "NORMAL";

interface Game {
  id: number;
  status: GameStatus;
  result: number;
  steam_match_id: number;
  type: GameType;
  game_started_at: string;
  game_created_at: string;
  players?: {
    radiant: string[];
    dire: string[];
  };
}

export default function GamesCrud({ gamesList }: { gamesList: Game[] }) {
  console.log({ gamesList });
  const [games, setGames] = useState(gamesList);
  const [filterStatus, setFilterStatus] = useState<GameStatus | "ALL">(
    "STARTED"
  );
  const [loading, setLoading] = useState(false);

  const fetchGames = async () => {
    try {
      const res = await fetch("api/games-crud/games-crud-read");
      if (!res.ok) throw new Error("Failed to fetch games");
      const updatedGames = await res.json();
      setGames(updatedGames.games);
    } catch (error) {
      console.error("Error fetching games", error);
    }
  };

  // Pass gameId directly instead of using an index.
  const handleTeamWin = async (gameId: number, teamNum: number) => {
    const confirmation = confirm("Are you sure ?");
    if (!confirmation) return;
    setLoading(true);
    // Find the game from our games array.
    const game = games.find((g) => g.id === gameId);
    if (!game) {
      setLoading(false);
      return alert("Game not found");
    }
    if (game.status !== "STARTED") {
      setLoading(false);
      return alert(`${game.status} IS NOT A VALID GAME STATUS!!!`);
    }
    try {
      const res = await fetch(
        "api/games-crud/games-crud-update-winner-looser",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: gameId,
            team_won: teamNum,
            status: game.status,
          }),
        }
      );
      if (!res.ok) {
        throw new Error("Failed to update MMR based on winning team");
      }
      fetchGames();
    } catch (error) {
      console.error("Could not resolve a winner/looser", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (gameId: number) => {
    const confirmation = confirm("Are you sure ?");
    if (!confirmation) return;
    setLoading(true);
    // Look up the game from the games state.
    const game = games.find((g) => g.id === gameId);
    if (!game) {
      setLoading(false);
      return alert("Game not found");
    }
    try {
      const res = await fetch("/api/games-crud/games-crud-delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: gameId,
          status: game.status,
          result: game.result,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to delete game");
      }
      fetchGames();
    } catch (error) {
      console.error("Failed to delete the game", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (gameId: number) => {
    const confirmation = confirm("Are you sure ?");
    if (!confirmation) return;
    setLoading(true);
    const game = games.find((g) => g.id === gameId);
    if (!game) {
      setLoading(false);
      return alert("Game not found");
    }
    if (game.status !== "PREGAME" && game.status !== "HOSTED") {
      setLoading(false);
      return alert(`${game.status} IS NOT A VALID GAME STATUS!!!`);
    }
    try {
      const res = await fetch("api/games-crud/games-crud-update-cancel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: gameId, status: game.status }),
      });
      if (!res.ok) {
        throw new Error("Failed to Cancel the game!");
      }
      fetchGames();
    } catch (error) {
      console.error("Failed to Cancel the game!", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRegisterList =
    filterStatus === "ALL"
      ? games
      : games.filter((game) => game.status === filterStatus);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="text-3xl font-bold mb-4">Games</h1>
          </CardTitle>
          <CardDescription>
            <ul>
              <li>
                If game is in status OVER, and you delete it, MMR will be
                reverted
              </li>
              <li>
                If game is in status any other status except OVER, and you
                delete it, MMR will NOT be changed
              </li>
              <li>
                If you resolve winner by clicking (dire/radiant won) game will
                be set to status OVER and MMR will be updated.
              </li>
            </ul>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Controls */}
          <div className="mb-4">
            <label htmlFor="status-filter" className="mr-2">
              Filter by Status:
            </label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as GameStatus | "ALL")
              }
              className="p-2 border rounded"
            >
              <option value="ALL">All</option>
              <option value="PREGAME">Pregame</option>
              <option value="HOSTED">Hosted</option>
              <option value="STARTED">Started</option>
              <option value="OVER">Over</option>
              <option value="ABORTED">Aborted</option>
              <option value="CANCEL">Cancel</option>
              <option value="REHOST">Rehost</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <tr>
                  <TableHeaderCell>Id</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Result</TableHeaderCell>
                  <TableHeaderCell>Steam Match Id</TableHeaderCell>
                  <TableHeaderCell>Type</TableHeaderCell>
                  <TableHeaderCell>Game Created At</TableHeaderCell>
                  <TableHeaderCell>Game Started At</TableHeaderCell>
                  <TableHeaderCell>Radiant Team</TableHeaderCell>
                  <TableHeaderCell>Dire Team</TableHeaderCell>
                  <TableHeaderCell>Delete Game</TableHeaderCell>
                  <TableHeaderCell>Cancel Game</TableHeaderCell>
                  <TableHeaderCell>Dire Won</TableHeaderCell>
                  <TableHeaderCell>Radiant Won</TableHeaderCell>
                </tr>
              </TableHeader>
              <TableBody>
                {filteredRegisterList.map((game) => (
                  <TableRow key={game.id}>
                    <TableCell>{game.id}</TableCell>
                    <TableCell>{game.status}</TableCell>
                    <TableCell>
                      {game.result == null ? "N/A" : game.result}
                    </TableCell>
                    <TableCell>{game.steam_match_id}</TableCell>
                    <TableCell>{game.type}</TableCell>
                    <TableCell>{game.game_created_at}</TableCell>
                    <TableCell>{game.game_started_at}</TableCell>
                    <TableCell>
                      {game.players ? game.players.radiant.join(", ") : "N/A"}
                    </TableCell>
                    <TableCell>
                      {game.players ? game.players.dire.join(", ") : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Button
                        disabled={loading}
                        onClick={() => handleDelete(game.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                    <TableCell>
                      {["PREGAME", "HOSTED"].includes(game.status) && (
                        <Button
                          disabled={loading}
                          onClick={() => handleCancel(game.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {game.status !== "OVER" && (
                        <Button
                          disabled={loading}
                          onClick={() => handleTeamWin(game.id, DIRE)}
                        >
                          Dire Won
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {game.status !== "OVER" && (
                        <Button
                          disabled={loading}
                          onClick={() => handleTeamWin(game.id, RADIANT)}
                        >
                          Radiant Won
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
