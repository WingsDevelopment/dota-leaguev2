// nextjs/db/initDatabase.ts
import fs from "fs/promises";
import path from "path";
import { getDbInstance } from "@/db/utils";
import { Database } from "sqlite3";

export async function initDatabase(): Promise<void> {
  const db = await getDbInstance();
  try {
    const schemaPath = path.join(process.cwd(), "..", "db-shemas", "shema.sql");
    const schema = await fs.readFile(schemaPath, "utf-8");

    await new Promise<void>((resolve, reject) => {
      db.exec(schema, (err) => (err ? reject(err) : resolve()));
    });
  } finally {
    // Do not close the shared in-memory database during tests.
    closeDatabase(db);
  }
}

export const closeDatabase = async (db: Database): Promise<void> => {
  if (process.env.NODE_ENV !== "test") {
    db.close();
  }
};
