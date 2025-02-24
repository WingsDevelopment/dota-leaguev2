'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@/components/ui/table";
import { useState } from "react";

interface game {
    id: number,
    status: string,
    result: number,
    steam_match_id: number,
    type: string
}

export default function GamesCrud({ games }: { games: game[] }) {
    const [edit, setEdit] = useState(false)
    const [saveGame, setSaveGame] = useState({})
    const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
        console.log(e.currentTarget.value)
        setEdit(true)

    }
    const handleSave = (e: React.MouseEvent<HTMLButtonElement>)=>{
        const gameId= e.currentTarget.value
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

                            </tr>
                        </TableHeader>
                        <TableBody>
                            {games.map((game: game, index: any) => {

                                return (
                                    <>
                                        {edit ? (<TableRow key={game.id}>
                                            <TableCell>{game.id}</TableCell>
                                            <TableCell>{game.status}</TableCell>
                                            <TableCell>{game.result || "N/A"}</TableCell>
                                            <TableCell>{game.steam_match_id}</TableCell>
                                            <TableCell>{game.type}</TableCell>
                                            <TableCell>
                                                <button value={game.id} onClick={handleSave}>Save</button>
                                            </TableCell>
                                        </TableRow>
                                        ) : (
                                            <TableRow key={game.id}>
                                                <TableCell>{game.id}</TableCell>
                                                <TableCell>{game.status}</TableCell>
                                                <TableCell>{game.result || "N/A"}</TableCell>
                                                <TableCell>{game.steam_match_id}</TableCell>
                                                <TableCell>{game.type}</TableCell>
                                                <TableCell>
                                                    <button value={game.id} onClick={handleEdit}>Edit</button>
                                                </TableCell>
                                            </TableRow>
                                        )}
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