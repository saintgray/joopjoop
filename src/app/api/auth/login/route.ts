import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ ok: false, error: "DEPRECATED_USE_NEXTAUTH" }, { status: 410 });
}

