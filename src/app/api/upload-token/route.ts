import { NextResponse } from "next/server";

export async function POST() {
  const secretKey = process.env.ATLAS_SECRET_KEY;
  const atlasBaseUrl = process.env.IMAGE_SERVER_URL;

  if (!secretKey || !atlasBaseUrl) {
    return NextResponse.json({ ok: false, error: "SERVER_CONFIG_MISSING" }, { status: 500 });
  }

  const res = await fetch(`${atlasBaseUrl}/upload-token`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secretKey}` },
  }).catch(() => null);

  if (!res) return NextResponse.json({ ok: false, error: "ATLAS_TOKEN_FAILED" }, { status: 502 });
  if (!res.ok) return NextResponse.json({ ok: false, error: "ATLAS_TOKEN_FAILED" }, { status: 502 });

  const json = (await res.json().catch(() => null)) as { token?: string } | null;
  if (!json?.token) return NextResponse.json({ ok: false, error: "ATLAS_TOKEN_FAILED" }, { status: 502 });

  return NextResponse.json({ ok: true, token: json.token });
}

