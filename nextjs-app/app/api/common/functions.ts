import { NextResponse } from "next/server";

export const getUnauthorizedError = () => {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
};
