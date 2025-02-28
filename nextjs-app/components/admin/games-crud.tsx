'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@/components/ui/table";
import { useSession } from "next-auth/react";
import { useState } from "react";

type GameStatus = "PREGAME" | "HOSTED" | "STARTED" | "OVER" | "ABORTED" | "CANCEL" | "REHOST"
type GameType = "DRAFT" | "NORMAL"

interface game {
    id: number,
    status: GameStatus,
    result: number,
    steam_match_id: number,
    type: GameType
}

export default function GamesCrud({ gamesList }: { gamesList: game[] }) {
    const [games, setGames] = useState(gamesList);

    const handleTeamWin = async (e: React.MouseEvent<HTMLButtonElement>) => {
        const gameId = e.currentTarget.value
        const team = Number(e.currentTarget.name)
        const status= games[(Number(gameId))-1].status
        if (status !== "STARTED") {
            return alert(games[(Number(gameId))-1].status+" IS NOT A VALID GAME STATUS!!!")
        }
        try {
            const res = await fetch("api/games-crud/games-crud-update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: gameId, team_won: team, status:status })
            })
            if (!res.ok) {
                throw new Error("Failed to update MMR based on winning team")
            }
            setGames((pervGames) =>
                pervGames.map((game) =>
                    game.id === Number(gameId) ? { ...game, status: "OVER" } : game))
        } catch (error) {
            console.error(error)
        }
    }

    const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
        const gameId = e.currentTarget.value
        try {
            const res = await fetch("/api/games-crud/games-crud-delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: gameId })
            })

            if (!res.ok) {
                throw new Error("Failed to delete game")
            }
            setGames((prevGames) => prevGames.filter((game) => game.id !== Number(gameId)))
        } catch (error) {
            console.error("Failed to delete the game", error)
        }
    }
    return (<div>
        <Card>
            <CardHeader>
                <CardTitle>
                    <h1 className="text-3xl font-bold mb-4">Admin Page</h1>
                </CardTitle>
                <CardDescription>Edit games</CardDescription>
            </CardHeader>
            <CardContent>
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
                            </tr>
                        </TableHeader>
                        <TableBody>
                            {games.map((game: game) => {
                                return (
                                    <>
                                        <TableRow key={game.id}>
                                            <TableCell >{game.id}</TableCell>
                                            <TableCell >{game.status}</TableCell>
                                            <TableCell >{game.result || "N/A"}</TableCell>
                                            <TableCell >{game.steam_match_id}</TableCell>
                                            <TableCell >{game.type}</TableCell>
                                            <TableCell >
                                                <button value={game.id} name="0" onClick={handleTeamWin}>Radiant Won</button>
                                            </TableCell>
                                            <TableCell >
                                                <button value={game.id} name="1" onClick={handleTeamWin}>Dire Won</button>
                                            </TableCell>
                                            <TableCell ><button value={game.id} onClick={handleDelete}>Delete</button></TableCell>
                                        </TableRow>
                                    </>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </div>
    )
}