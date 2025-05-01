import { NextRequest, NextResponse } from "next/server";
import { isUserAdmin } from "@/app/common/constraints";
import { setReviewUserReport } from "@/app/services/userReport/setReviewUserReport";
import { getUnauthorizedError } from "../../common/functions";

export async function PUT(req: NextRequest) {
  if (!(await isUserAdmin())) return getUnauthorizedError();

  const { id } = await req.json();
  return NextResponse.json(await setReviewUserReport({ id }));
}
