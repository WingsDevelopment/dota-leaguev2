"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export function SignOut() {
  return (
    <div>
      <Button onClick={() => signOut({ redirect: true, callbackUrl: "/" })}>
        Sign Out
      </Button>
    </div>
  );
}
