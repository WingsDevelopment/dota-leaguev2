import { NextRequest, NextResponse } from "next/server";
import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";

export async function DELETE(req: NextRequest) {
  // Parse the JSON body for steam_id
  const { searchParams } = new URL(req.url);
  const steam_id = searchParams.get("steam_id");

  // Check if steam_id is provided
  if (!steam_id) {
    return NextResponse.json(
      { error: "Missing required field: steam_id" },
      { status: 400 }
    );
  }

  const db = await getDbInstance();
  try {
    // Delete the record with the given steam_id
    const changes = await new Promise<number>((resolve, reject) => {
      db.run(
        `DELETE FROM RegisterPlayers WHERE steam_id = ?`,
        [steam_id],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });

    closeDatabase(db);

    // Return appropriate response based on deletion result
    if (changes > 0) {
      return NextResponse.json({
        message: "Player record deleted successfully.",
      });
    } else {
      return NextResponse.json(
        { message: "Player record not found." },
        { status: 404 }
      );
    }
  } catch (error) {
    closeDatabase(db);
    console.error("Error processing DELETE request:", error);
    return NextResponse.json(
      { error: `Internal Server Error ${error}` },
      { status: 500 }
    );
  }
}
