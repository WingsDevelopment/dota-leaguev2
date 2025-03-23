"use client";
import { useEffect, useState } from "react";
import { Switch, SwitchLabel, SwitchWrapper } from "../ui/slider";
interface UserProfileProps {
  is_public_profile: boolean;
  discordId?: string; // Add discord_id here
  id: string;
}
export default function UserProfile({
  is_public_profile,
  discordId,
  id,
}: UserProfileProps) {
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
    const checkedNum = Number(checked);
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
      fetchIsPublic();
    } catch (error) {
      console.error("Failed to change view of Match History.", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>Profile</h1>
      <SwitchWrapper>
        <SwitchLabel>Match History Public</SwitchLabel>
        {/* <Switch onCheckedChange={publicSwitch} checked={check} /> */}
      </SwitchWrapper>
    </>
  );
}
