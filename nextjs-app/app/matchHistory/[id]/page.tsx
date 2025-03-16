import { baseUrl } from "@/app/common/constraints";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@/components/ui/table";
import { headers } from "next/headers";
import Link from "next/link";
import { heroMap, itemMap } from "./hero_and_items_images";

export interface MatchHistoryProps {
  params: {
    id: string;
    match: string// Next.js dynamic params are always strings
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
  hero_id: number,
  kills: number,
  deaths: number,
  assists: number,
  items: string
}
export default async function MatchHistory({ params }: MatchHistoryProps) {
  const { id } = params;
  const cookie = headers().get("cookie") || "";
  const [matchHistoryRes] = await Promise.all([
    fetch(`${baseUrl}/api/match-history-players/show-history?steam_id=${id}`, { //passovacu steam id preko leaderboards
      cache: "no-store",
      headers: { cookie },
    })
  ]);

  const matchHistoryData = await matchHistoryRes.json();

  const matchHistoryList = await matchHistoryData.matchHistory || [];

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const calculateKDA = (k: number, d: number, a: number) => {
    const kda = (k + a) / d
    return kda.toFixed(2);
  }

  const getHeroImage = (heroId: number) => {
    const heroName = heroMap[heroId];
    return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${heroName}.png`
  }
  const getItemImage = (items: string) => {
    console.log(JSON.parse(items))
    const itemArray = JSON.parse(items)
    const itemLink = itemArray.map((itemid: string) => {
      const num= itemMap[itemid]
        return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/items/${num}_lg.png`
      })
    console.log(itemLink)
    return itemLink;
  }
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="text-3xl font-bold mb-4">Match History</h1>
          </CardTitle>
          <CardDescription>Details</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Hero</TableHeaderCell>
                <TableHeaderCell>Result</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Duration</TableHeaderCell>
                <TableHeaderCell>KDA</TableHeaderCell>
                <TableHeaderCell>Items</TableHeaderCell>
                <TableHeaderCell>Show MATCH</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matchHistoryList.map((match: MatchHistory) => (
                <TableRow key={match.id}>
                  <TableCell><img src={getHeroImage(match.hero_id)} alt={heroMap[match.hero_id]} width={80} />
                    {heroMap[match.hero_id]}
                  </TableCell>
                  <TableCell>{match.winner}</TableCell>
                  <TableCell>{match.lobby_type}</TableCell>
                  <TableCell>{formatDuration(match.duration)}</TableCell>
                  <TableCell>{calculateKDA(match.kills, match.deaths, match.assists)}</TableCell>
                  <TableCell>
                    {getItemImage(match.items).map((link: string) => {
                      return <img src={link} alt="Item" width={50} />
                    })}
                  </TableCell>
                  <TableCell><Link href={`/matchHistory/${id}/${match.id}`}>Show Match</Link></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  )
}