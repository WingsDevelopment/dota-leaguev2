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
import { apiCallerGamesDelete } from "@/app/api/games-crud/games-crud-delete/caller";
import { getApiClientCallerConfig } from "@/app/api/common/clientUtils";
import { useRouter } from "next/navigation";
import { apiCallerGamesUpdateOrCancel } from "@/app/api/games-crud/games-crud-update-cancel/caller";
import { apiCallerGamesDeclareWinnerOrLoser } from "@/app/api/games-crud/games-crud-update-winner-loser/caller";

type GameStatus =
  | "PREGAME"
  | "HOSTED"
  | "STARTED"
  | "OVER"
  | "ABORTED"
  | "CANCEL"
  | "REHOST";
type GameType = "DRAFT" | "NORMAL";

export interface Game {
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
  const config = getApiClientCallerConfig()
  const router = useRouter()
  const [filterStatus, setFilterStatus] = useState<GameStatus | "ALL">(
    "STARTED"
  );


  // Pass gameId directly instead of using an index.
  const handleTeamWin = async (id: number, team_won: number) => {
    const confirmation = confirm("Are you sure ?");
    if (!confirmation) return;
    // Find the game from our games array.
    const game = gamesList.find((g) => g.id === id);
    if (!game) {
      return alert("Game not found");
    }
    try {
      apiCallerGamesDeclareWinnerOrLoser({params:{id,team_won,status:game.status},config}).then(()=>{
        router.refresh()
      })
      
    } catch (error) {
      console.error("Could not resolve a winner/looser", error);
    } 
  };

  const handleDelete = async (gameId: number) => {
    const confirmation = confirm("Are you sure ?");
    if (!confirmation) return;
    // Look up the game from the games state.
    const game = gamesList.find((g) => g.id === gameId);
    if (!game) {
      return alert("Game not found");
    }
    try {
      apiCallerGamesDelete({
        params: {
          id: gameId,
          status: game.status,
          result: game.result
        }, config
      }).then(() => {
        router.refresh()
      })
    } catch (error) {
      console.error("Failed to delete the game", error);
    }
  };

  const handleCancel = async (gameId: number) => {
    const confirmation = confirm("Are you sure ?");
    if (!confirmation) return;
    const game = gamesList.find((g) => g.id === gameId);
    if (!game) {
      return alert("Game not found");
    }
    if (game.status !== "PREGAME" && game.status !== "HOSTED") {
      return alert(`${game.status} IS NOT A VALID GAME STATUS!!!`);
    }
    try {
      apiCallerGamesUpdateOrCancel({ params: { id: gameId, status: game.status }, config }).then(() => {
        router.refresh()
      })
    } catch (error) {
      console.error("Failed to Cancel the game!", error);
    }
  };

  const filteredRegisterList =
    filterStatus === "ALL"
      ? gamesList
      : gamesList.filter((game) => game.status === filterStatus);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="text-3xl font-bold mb-4">Games</h1>
          </CardTitle>
          <CardDescription>

            If game is in status OVER, and you delete it, MMR will be
            reverted
            <br />
            If game is in status any other status except OVER, and you
            delete it, MMR will NOT be changed
            <br />
            If you resolve winner by clicking (dire/radiant won) game will
            be set to status OVER and MMR will be updated.

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
                        onClick={() => handleDelete(game.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                    <TableCell>
                      {["PREGAME", "HOSTED"].includes(game.status) && (
                        <Button
                          onClick={() => handleCancel(game.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {game.status !== "OVER" && (
                        <Button
                          onClick={() => handleTeamWin(game.id, DIRE)}
                        >
                          Dire Won
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {game.status !== "OVER" && (
                        <Button
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
