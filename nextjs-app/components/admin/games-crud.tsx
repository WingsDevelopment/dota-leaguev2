'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@/components/ui/table";
import { useSession } from "next-auth/react";
import { useState } from "react";

interface game {
    id: number,
    status: string,
    result: number,
    steam_match_id: number,
    type: string
}

export default function GamesCrud({ gamesList }: { gamesList: game[] }) {
    const [edit, setEdit] = useState(false)
    const [games, setGames] = useState(gamesList);
    const [saveGame, setSaveGame] = useState({})

    const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
        console.log(e.currentTarget.value)
        setEdit(true)

    }

    const handleSave = (e: React.MouseEvent<HTMLButtonElement>) => {
        const gameId = e.currentTarget.value
    }

    const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
        const gameId = e.currentTarget.value
        try {
            const res = await fetch("/api/games-crud", {
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
                                <TableHeaderCell>Edit</TableHeaderCell>
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
                                                {edit ? (
                                                    <button value={game.id} onClick={handleSave}>Save</button>
                                                ) : (
                                                    <button value={game.id} onClick={handleEdit}>Edit</button>
                                                )}
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