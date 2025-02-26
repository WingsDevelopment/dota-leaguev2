import { NextRequest, NextResponse } from "next/server";
import { getDbInstance } from "@/db/utils";


export async function DELETE(req: NextRequest) {
  const { id } = await req.json()

  if (!id) {
    return NextResponse.json({ error: "There is no game id" }, { status: 400 })
  }

  const db= await getDbInstance()
  
  try {

    const games: Array<Record<string, any>> = await new Promise(
      (resolve, reject) => {
        db.all(
          `DELETE
           FROM Game WHERE id = ?`,
          [id],
          (err, rows) => {
            if (err) {
              console.error("Error executing query:", err);
              return reject(err);
            }
            resolve(rows as any);
          }
        );
      }
    );

    // Close the database connection.
    db.close();

    return NextResponse.json({ games });
  } catch (error) {
    db.close();

    console.error("Error reading games:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }

}
export async function isUserAdmin(sessionId: string) {
  if (process.env.ADMIN_ID_1 === sessionId) {
    return true
  }
}
