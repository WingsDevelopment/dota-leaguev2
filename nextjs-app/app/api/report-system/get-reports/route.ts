import { NextResponse } from "next/server";
import { isUserAdmin } from "@/app/common/constraints";
import { getUserReports } from "@/app/services/userReport/getUserReports";
import { getUnauthorizedError } from "../../common/functions";

export async function GET() {
  if (!(await isUserAdmin())) return getUnauthorizedError();

  return NextResponse.json(await getUserReports());
}
