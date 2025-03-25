import { baseUrl } from "@/app/common/constraints";
import { headers } from "next/headers";
import ShowHistory from "@/components/matchHistory/showHistory";
import { auth, ExtendedUser } from "@/auth";
import UserProfile from "@/components/userProfile/userProfile";
import { fetcher } from "@/lib/fetch";

export interface MatchHistoryProps {
  params: {
    id: string;
    match: string; // Next.js dynamic params are always strings
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
  hero_id: number;
  kills: number;
  deaths: number;
  assists: number;
  items: string;
}

export default async function MatchHistory({ params }: MatchHistoryProps) {
  const session = await auth();
  const discordId = (session?.user as ExtendedUser)?.discordId
  const { id } = params;

  const matchHistoryList=(await fetcher(`${baseUrl}/api/match-history-players/show-history?steam_id=${id}`))?.data || []
  const playerList=(await fetcher(`${baseUrl}/api/player/get-player-by-steam-id?steam_id=${id}`))?.data || []
  const userSteamId=(await fetcher(`${baseUrl}/api/player/get-player-by-discord-id?discord_id=${discordId}`))?.data || []
  const likesAndDislikes=(await fetcher(`${baseUrl}/api/likes-dislikes/get-likes-and-dislikes?steam_id=${id}`))?.data || []
  
 if (playerList[0]?.is_public_profile) {
    return (
      <>
        <UserProfile
        ld={likesAndDislikes}
        userSteamId={userSteamId[0].steam_id}
        discordId={discordId}
        user={playerList[0]}
        />
        <ShowHistory matchHistoryList={matchHistoryList} discordId={discordId} />
      </>
    );
  } else {
    return (
      <>
        <UserProfile
        ld={likesAndDislikes}
        userSteamId={userSteamId[0].steam_id}
        discordId={discordId}
        user={playerList[0]}
        />
        <h1 className="text-3xl font-bold text-center mt-20">
          Sorry, this match history is private.
        </h1>
      </>
    );
  }
}
