"use client";
import {
  heroMap,
  itemMap,
} from "@/app/matchHistory/[id]/hero_and_items_images";
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
import {
  formatDuration,
  getHeroImage,
  getItemImage,
  heroToUppercase,
} from "@/lib/utils";
import React from "react";
import { useState } from "react";

export interface MatchHistory {
  id: number;
  match_id: number;
  league_id: number;
  start_time: number;
  duration: number;
  game_mode: string;
  lobby_type: string;
  region: string;
  winner: "radiant" | "dire";
  radiant_score: number;
  dire_score: number;
  additional_info: string;
  hero_id: number;
  kills: number;
  deaths: number;
  assists: number;
  items: string;
  result?: string; // "Win" or "Loss" calculated from API
}
export default function ShowHistory({ matchHistoryList,discordId }: { matchHistoryList: MatchHistory[],discordId?:string }) {
    const [showIframe, setShowIframe] = useState<number | null>(null);
    console.log(matchHistoryList)
    // ako je tvoj discord id i disabled je match histry mozes da vidis u suprotnom ne.
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
                                <>

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
                                                    return <img src={link[0]} alt='Item' title={link[1]} width={50} />
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
                                    {showIframe === match.match_id && (
                                        <TableRow>
                                            <TableCell colSpan={8} className="p-4">
                                                <iframe
                                                    src={`https://www.opendota.com/matches/${showIframe}`}
                                                    width="100%"
                                                    className="rounded-lg h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] min-h-[400px]"
                                                ></iframe>
                                            </TableCell>
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
