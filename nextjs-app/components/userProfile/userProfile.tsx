"use client";
import { useEffect, useState } from "react";
import { Switch, SwitchLabel, SwitchWrapper } from "../ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import LikesAndDislikes from "../likesAndDislikes/likesAndDislikes";
import { getAvatarUrl, mapUserDataToViewModel } from "@/lib/utils";
import ReportSystem from "../reportSystem/reportSystem";
import { apiCallerUpdatePlayerProfileVisibility } from "@/app/api/player/update-is-public-profile/caller";
import { useRouter } from "next/navigation";
import { Player } from "@/app/services/playerService/getPlayerBySteamId";
import { getApiServerCallerConfig } from "@/lib/getApiServerCallerConfig";
import { getApiClientCallerConfig } from "@/app/api/common/clientUtils";

export interface UserProfileProps {
  user: Player;
  ld: {
    likes: number;
    dislikes: number;
  };
  discordId?: string;
  userSteamId: string | null;
  isUserLiked?: number | null;
  isPublicProfile:boolean
}
export default function UserProfile({
  user,
  discordId,
  userSteamId,
  ld,
  isUserLiked,
  isPublicProfile
}: UserProfileProps) {
  if (!user) return;
  const config = getApiClientCallerConfig()
  const router = useRouter();

  const publicSwitch = async (check: boolean) => {
    const checked = Number(check);
    const confirmation = confirm("Are you sure ?");
    if (!confirmation) return;
    try {
      await apiCallerUpdatePlayerProfileVisibility({
        params: {
          checked,
          discord_id: String(user.discord_id),
        }, config
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to change view of Match History.", error);
    }
  };
  const { winRate, formattedDate } = mapUserDataToViewModel(user);
  return (
    <>
      <div className="flex items-center space-x-6">
        {/* Avatar Image */}
        <div className="h-20 w-20 bg-gray-200 rounded-full overflow-hidden border-2 border-gray-300 shadow-md">
          <img
            src={getAvatarUrl(String(user.discord_id))}
            alt={user.name ?? "User"}
            className="object-cover h-full w-full"
          />
        </div>

        {/* User Name and Switch */}
        <div className="flex items-center space-x-4">
          {/* User Name */}
          <div className="font-semibold text-lg">{user.name || "Anonymous User"}</div>

          {/* Match History Public Switch */}
        </div>
        {discordId === String(user.discord_id) ? (
          <></>
        ) : (
          <>
            {!discordId ? (
              <></>
            ) : (
              <>
                <LikesAndDislikes
                  userSteamId={userSteamId}
                  otherPlayerSteamId={String(user.steam_id)}
                  isUserLiked={isUserLiked}
                />
                <ReportSystem
                  otherPlayerSteamId={String(user.steam_id)}
                  userSteamId={userSteamId}
                />
              </>
            )}
          </>
        )}
      </div>
      {discordId === String(user.discord_id) ? (
        <div className="mt-5">
          <SwitchWrapper>
            <SwitchLabel className="text-sm">Match History Public</SwitchLabel>
            <Switch checked={isPublicProfile} onCheckedChange={publicSwitch} />
          </SwitchWrapper>
        </div>
      ) : (
        <></>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6">
        {/* Total Wins Card */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader>
            <CardTitle>Total wins</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{user.wins === null ? 0 : user.wins}</p>
          </CardContent>
        </Card>

        {/* Total Losses Card */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader>
            <CardTitle>Total losses</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{user.loses === null ? 0 : user.loses}</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader>
            <CardTitle>Winrate</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{winRate} %</p>
          </CardContent>
        </Card>

        {/* Win Streak Card */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader>
            <CardTitle>Win streak</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{user.streak === null ? 0 : user.streak}</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader>
            <CardTitle>MMR</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{user.mmr}</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader>
            <CardTitle>Likes</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{ld.likes}</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader>
            <CardTitle>Dislikes</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{ld.dislikes}</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader>
            <CardTitle>Joined</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{formattedDate}</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
