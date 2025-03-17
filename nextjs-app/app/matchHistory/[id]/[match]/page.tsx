import { headers } from "next/headers";
import { MatchHistoryProps } from "../page";
import { baseUrl } from "@/app/common/constraints";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@/components/ui/table";
import { heroMap, itemMap } from "../hero_and_items_images";

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

interface PlayerNames {
    name: String,
    steam_id: number
}
export default async function MatchHistory({ params }: MatchHistoryProps) {
    const { match } = params;
    const cookie = headers().get("cookie") || "";
    const [matchHistroyPlayerStatsRes, playerNamesRes] = await Promise.all([
        fetch(`${baseUrl}/api/match-history-players/show-stats?match_history_id=${match}`, {
            cache: "no-store",
            headers: { cookie },
        }),
        fetch(`${baseUrl}/api/match-history-players/get-player-names?match_history_id=${match}`, {
            cache: "no-store",
            headers: { cookie },
        })
    ]);

    const matchHistoryPlayerStatsData = await matchHistroyPlayerStatsRes.json();
    const playerNamesData = await playerNamesRes.json();
    const matchHistoryPlayerStatsList = matchHistoryPlayerStatsData.matchHistoryStats || [];
    const playerNamesList = playerNamesData.playerNames || [];
    console.log(matchHistoryPlayerStatsList, "LISTAAAAAAAAAAAAAAAAAAAAA")
    const getHeroImage = (heroId: number) => {
        const heroName = heroMap[heroId];

        return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${heroName}.png`
    }
    const heroToUppercase = (name: string) => {
        let stringSplit = name.split('_');
        for (let i = 0; i < stringSplit.length; i++) {
            stringSplit[i] = stringSplit[i].charAt(0).toUpperCase() + stringSplit[i].substring(1);
        }
        return stringSplit.join(' ');
    }
    const getItemImage = (items: string) => {
        console.log(JSON.parse(items))
        const itemArray = JSON.parse(items)
        const itemLink = itemArray.map((itemid: string) => {
            const num = itemMap[itemid]
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
                                <TableHeaderCell>Player</TableHeaderCell>
                                <TableHeaderCell>Kills</TableHeaderCell>
                                <TableHeaderCell>Deaths</TableHeaderCell>
                                <TableHeaderCell>Assists</TableHeaderCell>
                                <TableHeaderCell>Net Worth</TableHeaderCell>
                                <TableHeaderCell>Last Hits</TableHeaderCell>
                                <TableHeaderCell>Denies</TableHeaderCell>
                                <TableHeaderCell>Gold Per Minute</TableHeaderCell>
                                <TableHeaderCell>Xp Per Minute</TableHeaderCell>
                                <TableHeaderCell>Damage</TableHeaderCell>
                                <TableHeaderCell>Heal</TableHeaderCell>
                                <TableHeaderCell>Building Damage</TableHeaderCell>
                                <TableHeaderCell>Wards</TableHeaderCell>
                                <TableHeaderCell>Items</TableHeaderCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {matchHistoryPlayerStatsList.map((matchStat: MatchPlayerStats, index: number) => {
                                // Find the matching player name based on steam_id
                                const player = playerNamesList.find((p: any) => p.steam_id === matchStat.steam_id);

                                return (<>
                                    <TableRow key={matchStat.id}>
                                        <TableCell>
                                            <img src={getHeroImage(Number(matchStat.hero_id))} alt={heroMap[Number(matchStat.hero_id)]} width={80} />
                                            {heroToUppercase(heroMap[Number(matchStat.hero_id)])}
                                        </TableCell>
                                        <TableCell>{player ? player.name : "Unknown"}</TableCell>
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
                                        <TableCell>
                                            <div className="grid grid-cols-4 gap-1">
                                                {getItemImage(matchStat.items).map((link: string, index: number) => (
                                                    <img key={index} src={link} alt="Item" width={40} />
                                                ))}
                                            </div>
                                        </TableCell>

                                    </TableRow>
                                    {(index + 1) % 5 === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={16} style={{ height: "40px" }} />
                                        </TableRow>
                                    )}
                                </>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}