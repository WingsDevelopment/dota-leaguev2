// app/dashboard/page.tsx
import { Metadata } from "next";
import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "@/components/ui/table";
import Image from "next/image";
import { Tooltip } from "../components/ui/tooltip";
import Link from "next/link";

export const metadata: Metadata = {
  title: "RADEKOMSA LEADERBOARD",
  description: "RADEKOMSA LEADERBOARD.",
};

export default async function DashboardPage() {
  const session = await auth();

  // Provide a fallback base URL if NEXT_PUBLIC_API_URL is not defined.
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/leaderboard`, { cache: "no-store" });
  const data = await res.json();
  const leaderboard = data.leaderboard || [];
  console.log({ leaderboard });

  return (
    <>
      <div className="p-4">
        {/* Welcome Header */}

        {!session && (
          <div className="mb-6">
            <h2 className="text-3xl font-bold tracking-tight">
              Welcome to Radekomsa League Leaderboard
            </h2>
          </div>
        )}
        {session && (
          <>
            <div className="mb-6">
              <h2 className="text-3xl font-bold tracking-tight">
                Welcome {session.user?.name}
              </h2>
            </div>

            {/* Summary Cards */}
            <p className="my-2">Some random stats in the future</p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Total players</CardTitle>
                  <CardDescription>{leaderboard.length}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">+20.1% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Radekomsa wins</CardTitle>
                  <CardDescription>todo</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">todo</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Top heroes</CardTitle>
                  <CardDescription>todo</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">todo</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Active Now</CardTitle>
                  <CardDescription>todo</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">todo</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        <div className="w-full flex flex-col md:flex-row gap-1 my-4">
          <p className="font-bold">Donations:</p>
          <div className="flex flex-col md:flex-row gap-2">
            <Image src="/eth.svg" alt="ETH" width={24} height={24} />
            <p className="text-xs md:text-base md:font-bold text-cyan-500">
              0x410A11ed53a9a59094F24D2ae4ACbeF7f84955a1
            </p>

            <Image src="/eth.svg" alt="ETH" width={24} height={24} />
          </div>
        </div>

        {/* Leaderboard Table */}

        <Card>
          <CardHeader>
            <CardTitle>
              <h1 className="text-3xl font-bold mb-4">Leaderboard</h1>
            </CardTitle>
            <CardDescription>List of all players</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <tr>
                    <TableHeaderCell>#</TableHeaderCell>
                    <TableHeaderCell>MMR</TableHeaderCell>
                    <TableHeaderCell>Name</TableHeaderCell>
                    {/* <TableHeaderCell>Win</TableHeaderCell>
                <TableHeaderCell>Loss</TableHeaderCell>
                <TableHeaderCell>Win%</TableHeaderCell> */}
                  </tr>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((player: any, index: number) => {
                    return (
                      <TableRow
                        key={player.discord_id}
                        className="cursor-pointer"
                        onClick={() =>
                          (window.location.href = `/matchHistory/${player.steam_id}`)
                        }
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{player.mmr}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {player.captain === 1 && (
                              <Tooltip tooltip="Captain">
                                <Image
                                  src="/captain.svg"
                                  alt="captain"
                                  width={24}
                                  height={24}
                                />
                              </Tooltip>
                            )}
                            <span>{player.name}</span>
                            {player.discord_id === "662288348114845719" && (
                              <Tooltip tooltip="PI Milioner">
                                <Image
                                  src="/pi-milionare.svg"
                                  alt="pi-milionare"
                                  width={24}
                                  height={24}
                                />
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                        {/* <TableCell>{wins}</TableCell>
                    <TableCell>{losses}</TableCell>
                    <TableCell>{winPct}%</TableCell> */}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
