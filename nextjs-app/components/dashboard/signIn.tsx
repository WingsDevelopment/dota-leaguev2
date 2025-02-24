"use client";

import { Button } from "@/components/ui/button";
import { DiscordLogoIcon } from "@radix-ui/react-icons";
import { signIn } from "next-auth/react"; // or your client signIn function
import { useSession } from "next-auth/react";
import { UserNav } from "./user-nav";

export function SignIn() {
  const { data: session } = useSession();

  if (session) {
    return <UserNav />;
  }

  return (
    <div>
      <Button onClick={() => signIn("discord", { callbackUrl: "/" })}>
        <DiscordLogoIcon className="mr-2 h-4 w-4" /> Login with Discord
      </Button>
    </div>
  );
}
