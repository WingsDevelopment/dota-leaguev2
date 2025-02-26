import path from "path";

export const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
export const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "db", "league.db");