import { NextRequest, NextResponse } from "next/server";
import { isUserAdmin } from "@/app/common/constraints";
import { setReviewUserReport } from "@/app/services/userReport/setReviewUserReport";

export async function PUT(req: NextRequest) {
  if (!(await isUserAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  return NextResponse.json(await setReviewUserReport({ id }));
}
