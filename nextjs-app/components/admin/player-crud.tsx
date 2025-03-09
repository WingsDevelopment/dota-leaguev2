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
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Player {
    id: number;
    discord_id: number;
    steam_id: number;
    name: string;
    mmr: number;
    captain: number
    banned_until: string,
    games_left: number,
    games_griefed: number,
    bbb: number
}

export default function PlayerCrud({ playerList }: { playerList: Player[] }) {
    const [players, setPlayers] = useState(playerList);
    const [loading, setLoading] = useState(false)
    const [selectedValue, setSelectedValue] = useState<{ [key: number]: string }>({});

    const fetchPlayers = async () => {
        try {
            const res = await fetch("api/player/players-read");
            if (!res.ok) throw new Error("Failed to fetch games");
            const updatedPlayers = await res.json();
            setPlayers(updatedPlayers.players);
        } catch (error) {
            console.error("Error fetching games", error);
        }
    };

    const handleBanUnban = async (id: number, value: string) => {
        setLoading(true);
        if (value === "unban") {
            const confirmation = confirm("Are you sure you want to unban this player?");
            if (!confirmation) return;
        } else {
            const confirmation = confirm("Are you sure you want to ban this player?");
            if (!confirmation) return;
        }
        try {
            const res = await fetch("api/player/players-ban-unban", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, value })
            });
            if (!res.ok) {
                throw new Error("Failed to ban/unban player");
            }
            await fetchPlayers()
        } catch (error) {
            console.error("Failed to ban/unban player")
        } finally {
            setLoading(false);
        }
    }

    const handleSelectChange = (id: number, value: string) => {
        setSelectedValue((prev) => ({
            ...prev,
            [id]: value, // Update only the specific player's dropdown
        }));
    };

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
                                <TableHeaderCell>Banned Until</TableHeaderCell>
                                <TableHeaderCell>Games Left</TableHeaderCell>
                                <TableHeaderCell>Games Griefed</TableHeaderCell>
                                <TableHeaderCell>Bad Behaviour Ban</TableHeaderCell>
                                <TableHeaderCell>Ban Type</TableHeaderCell>
                                <TableHeaderCell>Ban Player</TableHeaderCell>
                                <TableHeaderCell>Unban Player</TableHeaderCell>
                            </tr>
                        </TableHeader>
                        <TableBody>
                            {players.map((player: Player, i: number) => {
                                return (
                                    <TableRow key={player.id}>
                                        <TableCell>{player.id}</TableCell>
                                        <TableCell>{player.discord_id}</TableCell>
                                        <TableCell>{player.steam_id}</TableCell>
                                        <TableCell>{player.name}</TableCell>
                                        <TableCell>{player.mmr}</TableCell>
                                        <TableCell>{player.captain}</TableCell>
                                        <TableCell>{player.banned_until}</TableCell>
                                        <TableCell>{player.games_left}</TableCell>
                                        <TableCell>{player.games_griefed}</TableCell>
                                        <TableCell>{player.bbb}</TableCell>
                                        <TableCell>
                                            <select
                                                id="status-filter"
                                                className="p-2 border rounded"
                                                value={selectedValue[player.id] || "1l"}
                                                onChange={(e) => handleSelectChange(player.id, e.currentTarget.value)}>
                                                <option value="1l">1 LEAVE</option>
                                                <option value="1g">1 GRIEF</option>
                                                <option value="bbb">BBB</option>
                                            </select></TableCell>
                                        <TableCell>
                                            <Button
                                                disabled={loading}
                                                onClick={() => handleBanUnban(player.id, selectedValue[player.id] ?? "1l")}
                                            >
                                                Ban Player
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                disabled={loading}
                                                onClick={() => handleBanUnban(player.id, "unban")}
                                            >
                                                Unban Player
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
