"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "@/components/ui/modal";
import { apiCallerBanPlayer } from "@/app/api/player/players-ban/caller";
import { apiCallerUnbanPlayer } from "@/app/api/player/players-unban/caller";
import { Player } from "@/app/services/playerService/getPlayerBySteamId";
import { apiCallerQueueUnvouchPlayer } from "../../app/api/player/player-queue-unvouch/caller";
import { apiCallerQueueVouchPlayer } from "../../app/api/player/player-queue-vouch/caller";
import { apiCallerGetPlayers } from "@/app/api/player/players-read/caller";
import { getApiClientCallerConfig } from "@/app/api/common/clientUtils";

export default function PlayerCrud({ playerList }: { playerList: Player[] }) {
  const router = useRouter();
  const [openModal, setOpenModal] = useState<number | "none">("none");

  async function sendBanRequest(
    steam_id: number,
    banType: "1l" | "1g" | "bbb" | "1d" | undefined
  ) {
    if (!confirm("Are you sure you want to ban this player?")) return;
    await apiCallerBanPlayer({ steam_id, banType });
    router.refresh();
    setOpenModal("none");
  }

  async function sendUnbanRequest(steam_id: number) {
    if (!confirm("Are you sure you want to unban this player?")) return;
    await apiCallerUnbanPlayer({ steam_id });
    router.refresh();
    setOpenModal("none");
  }

  async function handleVouch(steam_id: number, isCurrentlyVouched: boolean) {
    const action = isCurrentlyVouched
      ? apiCallerQueueUnvouchPlayer
      : apiCallerQueueVouchPlayer;
    const confirmMsg = isCurrentlyVouched
      ? "Are you sure you want to remove High MMR vouch from this player?"
      : "Are you sure you want to vouch this player for High MMR?";
    if (!confirm(confirmMsg)) return;
    await action({ steam_id, vouchLevel: 5 });
    router.refresh();
  }

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
                  <TableHeaderCell>High MMR queue Vouch</TableHeaderCell>
                </tr>
              </TableHeader>
              <TableBody>
                {playerList.map((player: Player) => {
                  const hasVouch = (player.queue_vouches || []).includes("5");
                  return (
                    <TableRow key={player.id}>
                      <TableCell>{player.id}</TableCell>
                      <TableCell>{player.discord_id}</TableCell>
                      <TableCell>{player.steam_id}</TableCell>
                      <TableCell>{player.name}</TableCell>
                      <TableCell>{player.mmr}</TableCell>
                      <TableCell>{player.captain ?? 0}</TableCell>
                      <TableCell>{player.banned_until ?? "No Ban Date"}</TableCell>
                      <TableCell>{player.games_didnt_show ?? 0}</TableCell>
                      <TableCell>{player.games_left ?? 0}</TableCell>
                      <TableCell>{player.games_griefed ?? 0}</TableCell>
                      <TableCell>{player.bbb ?? 0}</TableCell>

                      <TableCell>
                        <Modal
                          open={openModal === player.steam_id}
                          onOpenChange={(isOpen) =>
                            isOpen ? setOpenModal(player.steam_id) : setOpenModal("none")
                          }
                        >
                          <ModalTrigger onClick={() => setOpenModal(player.steam_id)}>
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
                        <Button onClick={() => sendUnbanRequest(player.steam_id)}>
                          Unban Player
                        </Button>
                      </TableCell>

                      <TableCell>
                        <Button onClick={() => handleVouch(player.steam_id, hasVouch)}>
                          {hasVouch ? "Unvouch" : "Vouch"}
                        </Button>
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
