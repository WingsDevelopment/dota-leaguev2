import { NextRequest, NextResponse } from "next/server";
import { getDbInstance } from "@/db/utils";
import { isUserAdmin } from "@/app/common/constraints";
import { ReviewUserReport } from "@/app/services/userReport/reviewUserReport";

export async function PUT(req: NextRequest) {
  if (!(await isUserAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  console.log(id,"id u service")
  if (!id === undefined) {
    return NextResponse.json(
      { error: "Missing report id" },
      { status: 400 }
    );
  }

  const res = await ReviewUserReport({id});
  return NextResponse.json(res);
}
