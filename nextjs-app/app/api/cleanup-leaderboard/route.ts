import { NextResponse } from "next/server";
import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";

export async function DELETE() {
  const db = await getDbInstance();
  try {
    const deleted = await new Promise<number>((resolve, reject) => {
      db.run(
        `DELETE FROM Players WHERE id IS NULL AND wins IS NULL AND loses IS NULL AND streak IS NULL`,
        [],
        function (err) {
          if (err) {
            console.error("Error executing delete query:", err);
            return reject(err);
          }
          // 'this.changes' holds the number of rows deleted
          resolve(this.changes);
        }
      );
    });

    return NextResponse.json({ deleted });
  } catch (error) {
    console.error("Error deleting players:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    closeDatabase(db);
  }
}
