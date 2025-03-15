import { baseUrl } from "@/app/common/constraints";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@/components/ui/table";
import { headers } from "next/headers";

interface MatchHistoryProps {
  params: {
    id: string; // Next.js dynamic params are always strings
  };
}
export interface MatchHistory {
  id: number;
  match_id: number;
  league_id: number;
  start_time: number; // Unix timestamp
  duration: number; // Match duration in seconds
  game_mode: string;
  lobby_type: string;
  region: string;
  winner: "radiant" | "dire"; // Enforce possible values
  radiant_score: number;
  dire_score: number;
  additional_info: string; // JSON string, might need parsing
}
export default async function MatchHistory({ params }: MatchHistoryProps) {
  const { id } = params;
  const steam_id = "76561198148976230" // hardcoded radi testiranja
  const cookie = headers().get("cookie") || "";
  const [matchHistoryRes, matchHistroyPlayerStatsRes] = await Promise.all([
    fetch(`${baseUrl}/api/match-history-players/show-history?steam_id=${steam_id}`, { //passovacu steam id preko leaderboards
      cache: "no-store",
      headers: { cookie },
    }),
    fetch(`${baseUrl}/api/match-history/player-stats`, {
      cache: "no-store",
      headers: { cookie },
    }),
  ]);

  const matchHistoryData = await matchHistoryRes.json();
  // const matchHistoryPlayerStatsData = await matchHistroyPlayerStatsRes.json();

  const matchHistoryList = await matchHistoryData.matchHistory || [];
  console.log(matchHistoryList)
  // const matchHistoryPlayerStatsList = matchHistoryPlayerStatsData.registerPlayers || [];

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="text-3xl font-bold mb-4">Request Vouch</h1>
          </CardTitle>
          <CardDescription>Registered Players</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Id</TableHeaderCell>
                <TableHeaderCell>League Id</TableHeaderCell>
                <TableHeaderCell>Start Time</TableHeaderCell>
                <TableHeaderCell>Duration</TableHeaderCell>
                <TableHeaderCell>Game Mode</TableHeaderCell>
                <TableHeaderCell>Lobby Type</TableHeaderCell>
                <TableHeaderCell>Region</TableHeaderCell>
                <TableHeaderCell>Winner</TableHeaderCell>
                <TableHeaderCell>Radiant Score</TableHeaderCell>
                <TableHeaderCell>Dire Score</TableHeaderCell>
                <TableHeaderCell>Additional Info</TableHeaderCell>

              </TableRow>
            </TableHeader>
            <TableBody>
              {matchHistoryList.map((match: MatchHistory) => (
                <TableRow key={match.id}>
                  <TableCell>{match.match_id}</TableCell>
                  <TableCell>{match.league_id}</TableCell>
                  <TableCell>{new Date(match.start_time * 1000).toLocaleString()}</TableCell>
                  <TableCell>{formatDuration(match.duration)}</TableCell>
                  <TableCell>{match.game_mode}</TableCell>
                  <TableCell>{match.lobby_type}</TableCell>
                  <TableCell>{match.region}</TableCell>
                  <TableCell>{match.winner}</TableCell>
                  <TableCell>{match.radiant_score}</TableCell>
                  <TableCell>{match.dire_score}</TableCell>
                  <TableCell>{match.additional_info}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  )
}