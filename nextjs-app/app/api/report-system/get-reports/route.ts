import { NextRequest, NextResponse } from "next/server";
import { getDbInstance } from "@/db/utils";
import { isUserAdmin } from "@/app/common/constraints";
import { closeDatabase } from "@/db/initDatabase";
import { getUserReports } from "@/app/services/userReport/getUserReports";

export async function GET() {
  const db = await getDbInstance();

  if (!(await isUserAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
   const res = await getUserReports();
   return NextResponse.json(res);
}
