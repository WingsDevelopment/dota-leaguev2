import sqlite3 from "sqlite3";
import path from "path";
import { NextResponse } from "next/server";

export const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function getDbInstance(): Promise<sqlite3.Database> {
    const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "db", "league.db");

    return await new Promise<sqlite3.Database>((resolve, reject) => {
        const instance = new sqlite3.Database(
            dbPath,
            sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
            (err) => {
                if (err) {
                    console.error("Error opening database:", err);
                    return reject(err);
                }
                resolve(instance);
            }
        );
    });
}