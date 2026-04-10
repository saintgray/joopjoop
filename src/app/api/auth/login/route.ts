import { NextResponse } from "next/server";
import { z } from "zod";
import { signIn } from "@/lib/auth";

const Schema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(72),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_INPUT" }, { status: 400 });
  }

  const user = await signIn(parsed.data);
  if (!user) {
    return NextResponse.json({ ok: false, error: "INVALID_CREDENTIALS" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, user });
}

