
import { baseUrl } from "@/app/common/constraints";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@/components/ui/table";
import { headers } from "next/headers";
import Link from "next/link";
import { heroMap, itemMap } from "./hero_and_items_images";
import { useState } from "react";
import ShowHistory from "@/components/matchHistory/showHistory";
import { useSession } from "next-auth/react";
import { auth, ExtendedUser } from "@/auth";
import UserProfile from "@/components/userProfile/userProfile";


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
  const session = await auth();
  const discordId = (session?.user as ExtendedUser)?.discordId
  const { id } = params;
  const cookie = headers().get("cookie") || "";
  const [matchHistoryRes, isPublicProfile] = await Promise.all([
    fetch(`${baseUrl}/api/match-history-players/show-history?steam_id=${id}`, {
      cache: "no-store",
      headers: { cookie },
    }),
    fetch(`${baseUrl}/api/player/is_public_profile?steam_id=${id}`, {
      cache: "no-store",
      headers: { cookie },
    })
  ]);

  const matchHistoryData = await matchHistoryRes.json();
  const isPublicProfileData = await isPublicProfile.json();
  const matchHistoryList = await matchHistoryData.data || [];
  const isPublicProfileSetting = await isPublicProfileData.isPublicProfile || [];
  const discord_id = isPublicProfileSetting[0]?.discord_id;
  const is_public_profile = isPublicProfileSetting[0]?.is_public_profile ?? false;

  if (discordId === discord_id) {
    return (<>
      <UserProfile is_public_profile={is_public_profile} discordId={discordId} id={id} />
      <ShowHistory matchHistoryList={matchHistoryList} discordId={discordId} />
    </>

    )
  } else if (is_public_profile) {
    return (
      <ShowHistory matchHistoryList={matchHistoryList} discordId={discordId} />
    )
  } else {
    return (<>
  <h1>Sorry, this match history is private.</h1>
    </>
    )
  }
}