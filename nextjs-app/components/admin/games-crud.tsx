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

type GameStatus =
  | "PREGAME"
  | "HOSTED"
  | "STARTED"
  | "OVER"
  | "ABORTED"
  | "CANCEL"
  | "REHOST";
type GameType = "DRAFT" | "NORMAL";

interface game {
  id: number;
  status: GameStatus;
  result: number;
  steam_match_id: number;
  type: GameType;
}

export default function GamesCrud({ gamesList }: { gamesList: game[] }) {
  const [games, setGames] = useState(gamesList);
  const [filterStatus, setFilterStatus] = useState<GameStatus | "ALL">(
    "ALL"
  );
  const [loading, setLoading] = useState(false);

  const fetchGames = async () => {
    try {
      const res = await fetch("api/games-crud/games-crud-read");
      if (!res.ok) throw new Error("Failed to fetch games");
      const updatedGames = await res.json();
      setGames(updatedGames.games)
    } catch (error) {
      console.error("Error fetching games", error)
    }
  }
  
  const handleTeamWin = async (i:number,teamNum:number) => {
    const confirmation = confirm("Are you sure ?");
    if (!confirmation) return;
    setLoading(true)
    const arrayNum = i;
    const gameId = games[arrayNum].id
    const team = teamNum;
    const status = games[arrayNum].status

    if (status !== "STARTED") {
      return alert(
        games[Number(gameId) - 1].status + " IS NOT A VALID GAME STATUS!!!"
      );
    }
    try {
      const res = await fetch("api/games-crud/games-crud-update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: gameId, team_won: team, status: status }),
      });
      if (!res.ok) {
        throw new Error("Failed to update MMR based on winning team");
      }
      fetchGames()
    } catch (error) {
      console.error("Could not resolve a winner/looser",error);
    }finally{
      setLoading(false)
    }
  };

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const confirmation = confirm("Are you sure ?");
    if (!confirmation) return;
    setLoading(true);
    const arrayNum = Number(e.currentTarget.value);
    const gameId = games[arrayNum].id
    const status = games[arrayNum].status
    const result = games[arrayNum].result
    try {
      const res = await fetch("/api/games-crud/games-crud-delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: gameId, status: status, result: result }),
      });

      if (!res.ok) {
        setLoading(false)
        throw new Error("Failed to delete game");
      }
      fetchGames()
      setLoading(false)
    } catch (error) {
      console.error("Failed to delete the game", error);
    }
  };
  const handleCancel=()=>{

  }
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
                  <TableHeaderCell>Radiant Team</TableHeaderCell>
                  <TableHeaderCell>Dire Team</TableHeaderCell>
                  <TableHeaderCell>Delete Game</TableHeaderCell>
                  <TableHeaderCell>Cancel Game</TableHeaderCell>
                </tr>
              </TableHeader>
              <TableBody>
                {filteredRegisterList.map((game: game, i: number) => {
                  return (
                    
                      <TableRow key={game.id}>
                        <TableCell>{game.id}</TableCell>
                        <TableCell>{game.status}</TableCell>
                        <TableCell>{game.result || "N/A"}</TableCell>
                        <TableCell>{game.steam_match_id}</TableCell>
                        <TableCell>{game.type}</TableCell>
                        <TableCell>
                          {game.status !== "OVER" && (
                            <Button
                              disabled={loading}
                              onClick={()=>handleTeamWin(i,0)}
                            >
                              Radiant Won
                            </Button>
                          )}

                        </TableCell>
                        <TableCell>
                          {game.status !== "OVER" && (
                            <Button
                              disabled={loading}
                              onClick={()=>handleTeamWin(i,1)}
                            >
                              Dire Won
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button disabled={loading} value={i} onClick={handleDelete}>
                            Delete
                          </Button>
                        </TableCell>
                        <TableCell>
                        {["PREGAME","HOSTED"].includes(game.status) && (
                            <Button
                              disabled={loading}
                              onClick={()=>handleTeamWin(i,1)}
                            >
                              Cancel
                            </Button>
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
