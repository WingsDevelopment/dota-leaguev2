"use client";

import { Button } from "@/components/ui/button";
import { signOutAction } from "../../app/actions/signOutAction";

export function SignOut() {
  return (
    <div>
      <form action={signOutAction}>
        <Button type="submit">Sign Out</Button>
      </form>
    </div>
  );
}
