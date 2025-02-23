// src/actions/signInDiscord.ts
"use server";

import { signIn } from "@/auth";

export async function signInDiscord() {
  await signIn("discord", { redirectTo: "/" });
}
