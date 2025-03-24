import { baseUrl } from "@/app/common/constraints";
import { headers } from "next/headers";
import ShowHistory from "@/components/matchHistory/showHistory";
import { auth, ExtendedUser } from "@/auth";
import UserProfile from "@/components/userProfile/userProfile";
import LikesAndDislikes from "@/components/likesAndDislikes/likesAndDislikes";

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
  const userImage = session?.user?.image ?? undefined
  const { id } = params;
  const cookie = headers().get("cookie") || "";
  // todo: we should fetcher instead
  const [matchHistoryRes, playerRes, userSteamIdRes, likesAndDislikesRes] = await Promise.all([
    fetch(`${baseUrl}/api/match-history-players/show-history?steam_id=${id}`, {
      cache: "no-store",
      headers: { cookie },
    }),
    fetch(`${baseUrl}/api/player/get-player-by-steam-id?steam_id=${id}`, {
      cache: "no-store",
      headers: { cookie },
    }),
    fetch(`${baseUrl}/api/player/get-player-by-discord-id?discord_id=${discordId}`, {
      cache: "no-store",
      headers: { cookie },
    }),
    fetch(`${baseUrl}/api/likes-dislikes/get-likes-and-dislikes?steam_id=${id}`, {
      cache: "no-store",
      headers: { cookie },
    }),
  ]);

  const matchHistoryData = await matchHistoryRes.json();
  const playerData = await playerRes.json();
  const userSteamIdData = await userSteamIdRes.json()
  const likesAndDislikesResData = await likesAndDislikesRes.json()
  const matchHistoryList = (await matchHistoryData.data) || [];
  const playerList = await playerData?.data || [];
  const userSteamId = userSteamIdData.data;
  const likesAndDislikes = likesAndDislikesResData.data
  console.log(likesAndDislikes, "LIKEEEEE")
  if (discordId === playerList[0]?.discord_id) {
    return (<>
      <UserProfile
        ld={likesAndDislikes}
        userSteamId={userSteamId[0].steam_id}
        discordId={discordId}
        user={playerList[0]}
      />
      <ShowHistory matchHistoryList={matchHistoryList} discordId={discordId} />
    </>

    )
  } else if (playerList[0]?.is_public_profile) {
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
