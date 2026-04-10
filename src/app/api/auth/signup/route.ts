import { NextResponse } from "next/server";
import { z } from "zod";
import { signUp } from "@/lib/auth";

const Schema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(72),
  displayName: z.string().min(2).max(80),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_INPUT" }, { status: 400 });
  }

  try {
    const user = await signUp(parsed.data);
    return NextResponse.json({ ok: true, user });
  } catch {
    return NextResponse.json({ ok: false, error: "SIGNUP_FAILED" }, { status: 400 });
  }
}

