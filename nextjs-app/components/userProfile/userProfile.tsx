'use client'
import { useEffect, useState } from "react";
import { Switch, SwitchLabel, SwitchWrapper } from "../ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
interface UserProfileProps {
    is_public_profile: boolean;
    discordId?: string; // Add discord_id here
    id: string;
    userImage?: string,
    userName: string,
}
export default function UserProfile({ is_public_profile, discordId, id, userImage, userName }: UserProfileProps) {

    const [check, setCheck] = useState<boolean>(!!is_public_profile);
    const [loading, setLoading] = useState(false);

    const fetchIsPublic = async () => {
        try {
            const res = await fetch(`/api/player/is_public_profile?steam_id=${id}`);
            if (!res.ok) throw new Error("Failed to fetch games");
            const isPublicProfile = await res.json();
            setCheck(Boolean(isPublicProfile.isPublicProfile[0].is_public_profile));
        } catch (error) {
            console.error("Error fetching Match History View", error);
        }
    };

    const publicSwitch = async (checked: boolean) => {
        const checkedNum = Number(checked)
        const confirmation = confirm("Are you sure ?");
        if (!confirmation) return;
        setLoading(true);
        try {
            const res = await fetch("/api/player/update-is-public-profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ checked: checkedNum, discord_id: discordId }),
            });
            if (!res.ok) {
                throw new Error("Failed to Cancel the game!");
            }
            fetchIsPublic()

        } catch (error) {
            console.error("Failed to change view of Match History.", error);
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="flex items-center space-x-6">
                {/* Avatar Image */}
                <div className="h-20 w-20 bg-gray-200 rounded-full overflow-hidden border-2 border-gray-300 shadow-md">
                    <img
                        src={userImage ?? ""}
                        alt={userName ?? "User"}
                        className="object-cover h-full w-full"
                    />
                </div>

                {/* User Name and Switch */}
                <div className="flex items-center space-x-4">
                    {/* User Name */}
                    <div className="font-semibold text-lg">
                        {userName || "Anonymous User"}
                    </div>

                    {/* Match History Public Switch */}
                </div>
            </div>
            <div className="mt-5">

                <SwitchWrapper>
                    <SwitchLabel className="text-sm">Match History Public</SwitchLabel>
                    <Switch onCheckedChange={publicSwitch} checked={check} />
                </SwitchWrapper>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
                {/* Total Wins Card */}
                <Card className="shadow-lg hover:shadow-xl transition-all duration-200">
                    <CardHeader>
                        <CardTitle>Total wins</CardTitle>
                        <CardDescription></CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl font-semibold">51</p>
                    </CardContent>
                </Card>

                {/* Total Losses Card */}
                <Card className="shadow-lg hover:shadow-xl transition-all duration-200">
                    <CardHeader>
                        <CardTitle>Total losses</CardTitle>
                        <CardDescription></CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl font-semibold">51</p>
                    </CardContent>
                </Card>

                {/* Win Streak Card */}
                <Card className="shadow-lg hover:shadow-xl transition-all duration-200">
                    <CardHeader>
                        <CardTitle>Win streak</CardTitle>
                        <CardDescription></CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl font-semibold">51</p>
                    </CardContent>
                </Card>
            </div>

        </>
    )
}