import { NextRequest, NextResponse } from "next/server";
import { getDbInstance } from "@/db/utils";
import { isUserAdmin } from "@/app/common/constraints";

export async function PUT(req: NextRequest) {
  if (!(await isUserAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  if (!id === undefined) {
    return NextResponse.json(
      { error: "Missing report id" },
      { status: 400 }
    );
  }

  const db = await getDbInstance();
  try{

    await new Promise<void>((resolve, reject) => {
      db.run(`UPDATE UserReport SET reviewed = 1 WHERE id= ?`, [id], (err) => {
        if (err) {
          console.error("Error updating review:", err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: "Report is Solved",
    });

  } catch (error) {
    console.error("Error resolving the report", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    db.close();
  }
}
