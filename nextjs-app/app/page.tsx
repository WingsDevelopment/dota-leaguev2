// app/dashboard/page.tsx
import { Metadata } from "next";
import { auth } from "@/auth";
import { MainNav } from "@/components/dashboard/main-nav";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { Search } from "@/components/dashboard/search";
import { SignIn } from "@/components/dashboard/signIn";
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

export const metadata: Metadata = {
  title: "Dashboard Leaderboard",
  description: "Display the leaderboard with summary cards.",
};

export default async function DashboardPage() {
  const session = await auth();

  // Provide a fallback base URL if NEXT_PUBLIC_API_URL is not defined.
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/leaderboard`, { cache: "no-store" });
  const data = await res.json();
  const leaderboard = data.leaderboard || [];

  return (
    <>
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <Search />
            <ModeToggle />
            <SignIn />
          </div>
        </div>
      </div>
      <div className="p-4">
        {/* Welcome Header */}
        {session && (
          <>
            <div className="mb-6">
              <h2 className="text-3xl font-bold tracking-tight">
                Welcome {session.user?.name}
              </h2>
            </div>

            {/* Summary Cards */}
            <p>Some random stats in the future</p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Total players</CardTitle>
                  <CardDescription>todo</CardDescription>
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
                    // const wins = player.win || 0;
                    // const losses = player.loss || 0;
                    // const winPct =
                    //   wins + losses > 0
                    //     ? ((wins / (wins + losses)) * 100).toFixed(2)
                    //     : "0.00";
                    return (
                      <TableRow key={player.discord_id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{player.mmr}</TableCell>
                        <TableCell>{player.name || "N/A"}</TableCell>
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
