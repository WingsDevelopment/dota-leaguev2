import { ExtendedUser } from "./../../../auth";
import { auth } from "@/auth";
import path from "path";

export const baseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const dbPath =
  process.env.DATABASE_PATH || path.join(process.cwd(), "db", "league.db");

export async function isUserAdmin() {
  if (process.env.NODE_ENV === "development") {
    return true;
  }
  const session = await auth();
  const adminIds = (process.env.ADMIN_IDS || "").split(",");
  console.log("adminIds", adminIds);
  console.log("session", session);
  console.log("includes", adminIds.includes(String(session?.user?.id)));
  return adminIds.includes(String((session?.user as ExtendedUser)?.discordId));
}
