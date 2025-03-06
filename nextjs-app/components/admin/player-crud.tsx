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




interface Player {
    id: number;
    discord_id: number;
    steam_id: number;
    name: string;
    mmr: number;
    captain: number
}

export default function PlayerCrud({ playerList }: { playerList: Player[] }) {

    const handleBan = (i: number) => { }
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>
                        <h1 className="text-3xl font-bold mb-4">Players</h1>
                    </CardTitle>
                    <CardDescription>Edit Players</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <tr>
                                <TableHeaderCell>Id</TableHeaderCell>
                                <TableHeaderCell>Discrod Id</TableHeaderCell>
                                <TableHeaderCell>Steam Id</TableHeaderCell>
                                <TableHeaderCell>Name</TableHeaderCell>
                                <TableHeaderCell>MMR</TableHeaderCell>
                                <TableHeaderCell>Captain</TableHeaderCell>
                            </tr>
                        </TableHeader>
                        <TableBody>
                            {playerList.map((player: Player, i: number) => {
                                return (
                                    <TableRow key={player.id}>
                                        <TableCell>{player.id}</TableCell>
                                        <TableCell>{player.discord_id}</TableCell>
                                        <TableCell>{player.steam_id}</TableCell>
                                        <TableCell>{player.name}</TableCell>
                                        <TableCell>{player.mmr}</TableCell>
                                        <TableCell>{player.captain}</TableCell>
                                        <TableCell>
                                            <Button

                                                onClick={() => handleBan(i)}
                                            >
                                                Ban Player
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
