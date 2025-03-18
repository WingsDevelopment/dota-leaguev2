
import { baseUrl } from "@/app/common/constraints";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@/components/ui/table";
import { headers } from "next/headers";
import Link from "next/link";
import { heroMap, itemMap } from "./hero_and_items_images";
import { useState } from "react";
import ShowHistory from "@/components/matchHistory/showHistory";

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
  console.log(matchHistoryList,"listaaa")
  return (
    <ShowHistory matchHistoryList={matchHistoryList}/>
  )
}