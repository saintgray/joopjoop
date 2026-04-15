import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ ok: false, error: "DEPRECATED_USE_REGISTER" }, { status: 410 });
}

