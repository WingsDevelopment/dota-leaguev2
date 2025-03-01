import sqlite3 from "sqlite3";
import { dbPath } from "@/app/common/constraints";

export function getDbInstance(): Promise<sqlite3.Database> {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(
            dbPath,
            sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
            (err) => {
                if (err) {
                    console.error("Error opening database:", err);
                    reject(err);
                } else {
                    resolve(db);
                }
            }
        );
    });
}