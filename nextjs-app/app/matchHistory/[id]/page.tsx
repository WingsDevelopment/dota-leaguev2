import { baseUrl } from "@/app/common/constraints";
import { headers } from "next/headers";
import ShowHistory from "@/components/matchHistory/showHistory";
import { auth, ExtendedUser } from "@/auth";
import UserProfile from "@/components/userProfile/userProfile";
import { fetcher } from "@/lib/fetch";
import { apiCallerGetMatchHistory } from "@/app/api/match-history-players/show-history/caller";
import { apiCallerGetPlayerBySteamId } from "@/app/api/player/get-player-by-steam-id/caller";
import { apiCallerGetPlayerSteamIdByDiscordId } from "@/app/api/player/get-player-steam-id-by-discord-id/caller";
import { apiCallerGetLikesAndDislikesBySteamId } from "@/app/api/likes-dislikes/get-likes-and-dislikes/caller";

export interface MatchHistoryProps {
  params: {
    id: string | undefined | null;
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
  const discordId = (session?.user as ExtendedUser)?.discordId;
  const { id } = params;
  const [matchHistoryRes, playerRes, userSteamIdRes, likesAndDislikesRes] =
    await Promise.all([
      apiCallerGetMatchHistory({steamId:id}),
      await apiCallerGetPlayerBySteamId({ steam_id: id }),
      await apiCallerGetPlayerSteamIdByDiscordId({ discordId }),
      await apiCallerGetLikesAndDislikesBySteamId({steam_id: id})
    ]);

const matchHistoryList = matchHistoryRes;
  const playerList = playerRes;
  const userSteamId = userSteamIdRes.steam_id;
  const likesAndDislikes = likesAndDislikesRes;
  const userSteamIdValue = userSteamId ?? null;
  const isUserLikedOrDisliked = userSteamIdValue
    ? (
      await fetcher(
        `${baseUrl}/api/likes-dislikes/is-user-liked-or-disliked?steam_id=${id}&user_steam_id=${userSteamIdValue}`
      )
    )?.data
    : [];

  const isOwnProfile = playerList?.discord_id === Number(discordId);
  if (playerList.is_public_profile || isOwnProfile) {
    return (
      <div className="flex flex-col gap-8">
        <UserProfile
          isUserLiked={isUserLikedOrDisliked[0]?.likes_dislikes ?? null}
          ld={likesAndDislikes}
          userSteamId={userSteamIdValue}
          discordId={discordId}
          user={playerList}
        />
        <ShowHistory
          matchHistoryList={matchHistoryList}
          discordId={discordId}
        />
      </div>
    );
  } else {
    return (
      <div className="flex flex-col gap-8">
        <UserProfile
          isUserLiked={isUserLikedOrDisliked[0]?.likes_dislikes}
          ld={likesAndDislikes}
          userSteamId={userSteamIdValue}
          discordId={discordId}
          user={playerList}
        />
        <h1 className="text-3xl font-bold text-center mt-20">
          Sorry, this match history is private.
        </h1>
      </div>
    );
  }
}
