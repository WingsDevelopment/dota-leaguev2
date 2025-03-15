import { headers } from "next/headers";
import { MatchHistoryProps } from "../page";
import { baseUrl } from "@/app/common/constraints";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@/components/ui/table";

export interface MatchPlayerStats {
    id: number;
    match_history_id: number;
    steam_id: string;
    hero_id: string;
    kills: number;
    deaths: number;
    assists: number;
    net_worth: number;
    last_hits: number;
    denies: number;
    gpm: number;
    xpm: number;
    damage: number;
    heal: number;
    building_damage: number;
    wards_placed: number;
    items: string;
}


export default async function MatchHistory({ params }: MatchHistoryProps) {
    const { match } = params;
    const cookie = headers().get("cookie") || "";
    const [matchHistroyPlayerStatsRes] = await Promise.all([
        fetch(`${baseUrl}/api/match-history-players/show-stats?match_history_id=${match}`, {
            cache: "no-store",
            headers: { cookie },
        }),
    ]);

    const matchHistoryPlayerStatsData = await matchHistroyPlayerStatsRes.json();
    const matchHistoryPlayerStatsList = matchHistoryPlayerStatsData.matchHistoryStats || [];
    console.log(matchHistoryPlayerStatsList)
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
                                <TableHeaderCell>Match History Id</TableHeaderCell>
                                <TableHeaderCell>Steam Id</TableHeaderCell>
                                <TableHeaderCell>Hero Id</TableHeaderCell>
                                <TableHeaderCell>Kills</TableHeaderCell>
                                <TableHeaderCell>Deaths</TableHeaderCell>
                                <TableHeaderCell>Assists</TableHeaderCell>
                                <TableHeaderCell>Net Worth</TableHeaderCell>
                                <TableHeaderCell>Last Hits</TableHeaderCell>
                                <TableHeaderCell>Denies</TableHeaderCell>
                                <TableHeaderCell>XPM</TableHeaderCell>
                                <TableHeaderCell>GPM</TableHeaderCell>
                                <TableHeaderCell>Damage</TableHeaderCell>
                                <TableHeaderCell>Heal</TableHeaderCell>
                                <TableHeaderCell>Building Damage</TableHeaderCell>
                                <TableHeaderCell>Wards Placed</TableHeaderCell>
                                <TableHeaderCell>Items</TableHeaderCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {matchHistoryPlayerStatsList.map((matchStat: MatchPlayerStats, index: number) => (
                                <>

                                    <TableRow key={matchStat.id}>
                                        <TableCell>{matchStat.match_history_id}</TableCell>
                                        <TableCell>{matchStat.steam_id}</TableCell>
                                        <TableCell>{matchStat.hero_id}</TableCell>
                                        <TableCell>{matchStat.kills}</TableCell>
                                        <TableCell>{matchStat.deaths}</TableCell>
                                        <TableCell>{matchStat.assists}</TableCell>
                                        <TableCell>{matchStat.net_worth}</TableCell>
                                        <TableCell>{matchStat.last_hits}</TableCell>
                                        <TableCell>{matchStat.denies}</TableCell>
                                        <TableCell>{matchStat.gpm}</TableCell>
                                        <TableCell>{matchStat.xpm}</TableCell>
                                        <TableCell>{matchStat.damage}</TableCell>
                                        <TableCell>{matchStat.heal}</TableCell>
                                        <TableCell>{matchStat.building_damage}</TableCell>
                                        <TableCell>{matchStat.wards_placed}</TableCell>
                                        <TableCell>{matchStat.items}</TableCell>
                                    </TableRow>
                                    {(index + 1) % 5 === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={16} style={{ height: "10px" }} />
                                        </TableRow>
                                    )}
                                </>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}