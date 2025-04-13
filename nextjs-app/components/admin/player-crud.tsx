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
import { apiCallerBanPlayer } from "@/app/api/player/players-ban/caller";
import { useRouter } from "next/navigation";
import { apiCallerUnbanPlayer } from "@/app/api/player/players-unban/caller";
import { Player } from "@/app/services/playerService/getPlayerBySteamId";


export default function PlayerCrud({ playerList }: { playerList: Player[] }) {
  const router = useRouter()
  const [openModal, setOpenModal] = useState<number | "none">("none"); // Track which modal is open


  const sendBanRequest = async (steam_id: number, banType: "1l" | "1g" | "bbb" | "1d" | undefined) => {
    if (!confirm("Are you sure you want to ban this player?")) return;
    apiCallerBanPlayer({ steam_id, banType }).then(() => {
      router.refresh();
      setOpenModal("none");
    });

  };
  const sendUnbanBanRequest = async (steam_id: number) => {
    if (!confirm("Are you sure you want to unban this player?")) return;
    apiCallerUnbanPlayer({ steam_id }).then(() => {
      router.refresh();
      setOpenModal("none");
    });
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
                {playerList.map((player: Player) => (
                  <TableRow key={player.id}>
                    <TableCell>{player.id}</TableCell>
                    <TableCell>{player.discord_id}</TableCell>
                    <TableCell>{player.steam_id}</TableCell>
                    <TableCell>{player.name}</TableCell>
                    <TableCell>{player.mmr}</TableCell>
                    <TableCell>{player.captain == null ? 0 : player.captain}</TableCell>
                    <TableCell>{player.banned_until== null ? "No Ban Date" : player.banned_until}</TableCell>
                    <TableCell>{player.games_didnt_show == null ? 0 : player.games_didnt_show}</TableCell>
                    <TableCell>{player.games_left == null ? 0 : player.games_left}</TableCell>
                    <TableCell>{player.games_griefed == null ? 0 : player.games_griefed}</TableCell>
                    <TableCell>{player.bbb == null ? 0 : player.bbb}</TableCell>

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
                              onClick={() => sendBanRequest(player.steam_id, "1d")}
                            >
                              1 Game Didn't Show
                            </Button>
                            <Button
                              onClick={() => sendBanRequest(player.steam_id, "1l")}
                            >
                              1 Game Left
                            </Button>
                            <Button
                              onClick={() => sendBanRequest(player.steam_id, "1g")}
                            >
                              1 Game Griefed
                            </Button>
                            <Button
                              onClick={() => sendBanRequest(player.steam_id, "bbb")}
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
                        onClick={() => sendUnbanBanRequest(player.steam_id)}
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
