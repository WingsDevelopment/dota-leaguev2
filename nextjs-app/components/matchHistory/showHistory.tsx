'use client'
import { baseUrl } from "@/app/common/constraints";
import { heroMap, itemMap } from "@/app/matchHistory/[id]/hero_and_items_images";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@/components/ui/table";
import { headers } from "next/headers";
import Link from "next/link";

import { useState } from "react";

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
export default function ShowHistory({ matchHistoryList }: { matchHistoryList: MatchHistory[] }) {
    const [showIframe, setShowIframe] = useState<number | null>(null);

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
            const num = itemMap[itemid]
            return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/items/${num}_lg.png`
        })
        console.log(itemLink)
        return itemLink;
    }

    const heroToUppercase = (name: string) => {
        let stringSplit = name.split('_');
        for (let i = 0; i < stringSplit.length; i++) {
            stringSplit[i] = stringSplit[i].charAt(0).toUpperCase() + stringSplit[i].substring(1);
        }
        return stringSplit.join(' ');
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
                                <TableHeaderCell>Duration</TableHeaderCell>
                                <TableHeaderCell>Kill</TableHeaderCell>
                                <TableHeaderCell>Death</TableHeaderCell>
                                <TableHeaderCell>Assists</TableHeaderCell>

                                <TableHeaderCell>Items</TableHeaderCell>
                                <TableHeaderCell>Show MATCH</TableHeaderCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {matchHistoryList.map((match: MatchHistory) => (
                                <TableRow key={match.id}>
                                    <TableCell>
                                        <div className="lg:flex sm:grid sm-grid-column-2 md:grid md-grid-column-2 gap-2 text-center items-center">
                                            <img src={getHeroImage(match.hero_id)} alt={heroMap[match.hero_id]} width={80} />
                                            <p>
                                                {heroToUppercase(heroMap[match.hero_id])}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{match.winner}</TableCell>
                                    <TableCell>{formatDuration(match.duration)}</TableCell>
                                    <TableCell>{match.kills}</TableCell>
                                    <TableCell>{match.deaths}</TableCell>
                                    <TableCell>{match.assists}</TableCell>
                                    <TableCell>
                                        <div className="lg:grid lg:grid-cols-6 gap-1 md:grid md:grid-cols-3 sm:grid sm:grid-cols-2">

                                            {getItemImage(match.items).map((link: string) => {
                                                return <img src={link} alt="Item" width={50} />
                                            })}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <button
                                            onClick={() =>
                                                setShowIframe(showIframe === match.match_id ? null : match.match_id)
                                            }
                                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                        >
                                            {showIframe === match.match_id ? "Hide Match" : "Show Match"}
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {showIframe && (
                <div className="mt-4 p-4 border rounded-lg shadow-lg bg-white">
                    <iframe
                        src={`https://www.opendota.com/matches/${showIframe}`}
                        width="100%"
                        height="700"
                        className="rounded-lg"
                    ></iframe>
                </div>
            )}
        </div>
    )
}