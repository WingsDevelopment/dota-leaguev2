import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";

interface SteamBotProps {
  id: number;
  username: string;
  password: string;
  status: number;
}

export default function SteamBots({
  steamBots,
}: {
  steamBots: SteamBotProps[];
}) {
  const statusText = (status: number) => {
    return status === 1 ? "In-game" : "Free";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1 className="text-3xl font-bold mb-4">Steam Bots</h1>
        </CardTitle>
        <CardDescription>View your Steam Bots below.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <tr>
                <TableHeaderCell>ID</TableHeaderCell>
                <TableHeaderCell>Username</TableHeaderCell>
                <TableHeaderCell>Password</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </tr>
            </TableHeader>
            <TableBody>
              {steamBots.map((bot) => (
                <TableRow key={bot.id}>
                  <TableCell>{bot.id}</TableCell>
                  <TableCell>{bot.username}</TableCell>
                  <TableCell>{bot.password.at(0) + "*****"}</TableCell>
                  <TableCell>{statusText(bot.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
