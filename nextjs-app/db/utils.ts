import sqlite3 from "sqlite3";
import { dbPath } from "@/app/common/constraints";

let testDb: sqlite3.Database | null = null;

export function getDbInstance(): Promise<sqlite3.Database> {
  if (process.env.NODE_ENV === "test") {
    if (testDb) {
      return Promise.resolve(testDb);
    } else {
      testDb = new sqlite3.Database(":memory:");
      return Promise.resolve(testDb);
    }
  }
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
