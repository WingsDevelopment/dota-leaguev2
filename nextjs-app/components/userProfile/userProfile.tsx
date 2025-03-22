'use client'
import { useState } from "react";
import { Switch, SwitchLabel, SwitchWrapper } from "../ui/slider";
interface UserProfileProps {
    is_public_profile: boolean;
    discordId?: string; // Add discord_id here
}
export default function UserProfile({ is_public_profile, discordId }: UserProfileProps) {

    const [check, setCheck] = useState<boolean>(!!is_public_profile);

    const publicSwitch = async (checked: boolean) => {
        
        const checkedNum= Number(checked)
        const confirmation = confirm("Are you sure ?");
        if (!confirmation) return;
        const res = await fetch("/api/player/update-is-public-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ checked: checkedNum, discord_id: discordId }),
        });
        setCheck(checked);
    }

    return (
        <>
            <h1>Profile</h1>
            <SwitchWrapper>
                <SwitchLabel>Match History Public</SwitchLabel>
                <Switch onCheckedChange={publicSwitch} checked={check} />
            </SwitchWrapper>
        </>
    )
}