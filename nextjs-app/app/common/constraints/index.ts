import { Origin } from "@/app/api/common/interfaces";
import { ExtendedUser, auth } from "@/auth";
import path from "path";


// export const baseUrl = "https://radekomsa.site";
export const baseUrl = "http://127.0.0.1:3000";

export const getBaseUrl = (origin?: Origin) => {
  if (origin == null || origin === "server") {
    return baseUrl;
  }
  return "";
};

export const dbPath =
  process.env.DATABASE_PATH || path.join(process.cwd(), "db", "league.db");

export async function isUserAdmin() {
  console.log("?");
  if (process.env.NODE_ENV === "development") {
    console.log("??");
    return true;
  }
  const session = await auth();
  const adminIds = (process.env.ADMIN_IDS || "").split(",");
  console.log("adminIds", adminIds);
  console.log("session", session);
  console.log("includes", adminIds.includes(String(session?.user?.id)));
  console.log(
    "includes",
    adminIds.includes(String((session?.user as ExtendedUser)?.discordId))
  );
  console.log((session?.user as ExtendedUser)?.discordId, "Milos Discord Id");
  return adminIds.includes(String((session?.user as ExtendedUser)?.discordId));
}

export const RADIANT = 0;
export const DIRE = 1;
