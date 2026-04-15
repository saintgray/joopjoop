import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  // NextAuth signs out via /api/auth/signout; keep this route as a compatibility shim.
  const store = await cookies();
  store.set("next-auth.session-token", "", { path: "/", maxAge: 0 });
  store.set("__Secure-next-auth.session-token", "", { path: "/", maxAge: 0 });
  return NextResponse.json({ ok: true });
}

