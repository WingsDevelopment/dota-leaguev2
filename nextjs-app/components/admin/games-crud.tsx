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
  // Optional players property containing arrays for each team.
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

  const handleTeamWin = async (i: number, teamNum: number) => {
    const confirmation = confirm("Are you sure ?");
    if (!confirmation) return;
    setLoading(true);
    const gameId = games[i].id;
    const status = games[i].status;

    if (status !== "STARTED") {
      setLoading(false);
      return alert(
        games[Number(gameId) - 1].status + " IS NOT A VALID GAME STATUS!!!"
      );
    }
    try {
      const res = await fetch(
        "api/games-crud/games-crud-update-winner-looser",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: gameId, team_won: teamNum, status }),
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

  const handleDelete = async (i: number) => {
    const confirmation = confirm("Are you sure ?");
    if (!confirmation) return;
    setLoading(true);

    const gameId = games[i].id;
    const status = games[i].status;
    const result = games[i].result;
    try {
      const res = await fetch("/api/games-crud/games-crud-delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: gameId, status, result }),
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

  const handleCancel = async (i: number) => {
    const confirmation = confirm("Are you sure ?");
    if (!confirmation) return;
    setLoading(true);
    const gameId = games[i].id;
    const status = games[i].status;
    if (status !== "PREGAME" && status !== "HOSTED") {
      setLoading(false);
      return alert(games[i].status + " IS NOT A VALID GAME STATUS!!!");
    }
    try {
      const res = await fetch("api/games-crud/games-crud-update-cancel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: gameId, status }),
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
          <CardDescription>Edit games</CardDescription>
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
                </tr>
              </TableHeader>
              <TableBody>
                {filteredRegisterList.map((game: Game, i: number) => {
                  return (
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
                          onClick={() => handleDelete(i)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                      <TableCell>
                        {["PREGAME", "HOSTED"].includes(game.status) && (
                          <Button
                            disabled={loading}
                            onClick={() => handleCancel(i)}
                          >
                            Cancel
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        {game.status !== "OVER" && (
                          <>
                            <Button
                              disabled={loading}
                              onClick={() => handleTeamWin(i, DIRE)}
                            >
                              Dire Won
                            </Button>
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        {game.status !== "OVER" && (
                          <>
                            <Button
                              disabled={loading}
                              onClick={() => handleTeamWin(i, RADIANT)}
                            >
                              Radiant Won
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
