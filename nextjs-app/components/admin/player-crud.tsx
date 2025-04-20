"use client";
import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTrigger,
} from "../ui/modal";

interface Player {
  id: number;
  discord_id: number;
  steam_id: number;
  name: string;
  mmr: number;
  captain: number;
  banned_until: string;
  games_didnt_show: number;
  games_left: number;
  games_griefed: number;
  bbb: number;
}

export default function PlayerCrud({ playerList }: { playerList: Player[] }) {
  const [players, setPlayers] = useState(playerList);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState<number | "none">("none"); // Track which modal is open

  const fetchPlayers = async () => {
    try {
      const res = await fetch("/api/player/players-read");
      if (!res.ok) throw new Error("Failed to fetch games");
      const updatedPlayers = await res.json();
      setPlayers(updatedPlayers.players);
    } catch (error) {
      console.error("Error fetching games", error);
    }
  };

  const sendBanRequest = async (id: number, value: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/player/players-ban-unban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, value }),
      });

      if (!res.ok) throw new Error("Failed to update player status");

      await fetchPlayers(); // Refresh player data
    } catch (error) {
      console.error("Error updating player status", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle banning logic
  const handleBan = async (id: number, value: string) => {
    if (!confirm("Are you sure you want to ban this player?")) return;
    await sendBanRequest(id, value);
    setOpenModal("none"); // Close modal after action
  };

  // Handle unbanning logic
  const handleUnban = async (id: number) => {
    if (!confirm("Are you sure you want to unban this player?")) return;
    await sendBanRequest(id, "unban");
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <tr>
                  <TableHeaderCell>Id</TableHeaderCell>
                  <TableHeaderCell>Discord Id</TableHeaderCell>
                  <TableHeaderCell>Steam Id</TableHeaderCell>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>MMR</TableHeaderCell>
                  <TableHeaderCell>Captain</TableHeaderCell>
                  <TableHeaderCell>Banned Until</TableHeaderCell>
                  <TableHeaderCell>Games Didn't Show</TableHeaderCell>
                  <TableHeaderCell>Games Left</TableHeaderCell>
                  <TableHeaderCell>Games Griefed</TableHeaderCell>
                  <TableHeaderCell>Bad Behaviour Ban</TableHeaderCell>
                  <TableHeaderCell>Ban Player</TableHeaderCell>
                  <TableHeaderCell>Unban Player</TableHeaderCell>
                </tr>
              </TableHeader>
              <TableBody>
                {players.map((player: Player) => (
                  <TableRow key={player.id}>
                    <TableCell>{player.id}</TableCell>
                    <TableCell>{player.discord_id}</TableCell>
                    <TableCell>{player.steam_id}</TableCell>
                    <TableCell>{player.name}</TableCell>
                    <TableCell>{player.mmr}</TableCell>
                    <TableCell>{player.captain}</TableCell>
                    <TableCell>{player.banned_until}</TableCell>
                    <TableCell>{player.games_didnt_show}</TableCell>
                    <TableCell>{player.games_left}</TableCell>
                    <TableCell>{player.games_griefed}</TableCell>
                    <TableCell>{player.bbb}</TableCell>

                    <TableCell>
                      <Modal
                        open={openModal === player.steam_id}
                        onOpenChange={(isOpen) =>
                          isOpen
                            ? setOpenModal(player.steam_id)
                            : setOpenModal("none")
                        }
                      >
                        <ModalTrigger onClick={() => setOpenModal(player.id)}>
                          Ban Player
                        </ModalTrigger>
                        <ModalContent>
                          <ModalHeader>Ban Player {player.name}</ModalHeader>
                          <ModalDescription>
                            <Button
                              onClick={() => handleBan(player.steam_id, "1d")}
                            >
                              1 Game Didn't Show
                            </Button>
                            <Button
                              onClick={() => handleBan(player.steam_id, "1l")}
                            >
                              1 Game Left
                            </Button>
                            <Button
                              onClick={() => handleBan(player.steam_id, "1g")}
                            >
                              1 Game Griefed
                            </Button>
                            <Button
                              onClick={() => handleBan(player.steam_id, "bbb")}
                            >
                              Bad Behaviour Ban
                            </Button>
                          </ModalDescription>

                          <div className="mt-4 flex justify-end">
                            <ModalClose
                              className="bg-red-600 text-white px-4 py-2 rounded"
                              onClick={() => setOpenModal("none")}
                            >
                              Close
                            </ModalClose>
                          </div>
                        </ModalContent>
                      </Modal>
                    </TableCell>

                    <TableCell>
                      <Button
                        disabled={loading}
                        onClick={() => handleUnban(player.steam_id)}
                      >
                        Unban Player
                      </Button>
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
