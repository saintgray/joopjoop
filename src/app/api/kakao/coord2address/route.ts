import { NextResponse } from "next/server";
import { z } from "zod";

const QuerySchema = z.object({
  x: z.coerce.number(), // lng
  y: z.coerce.number(), // lat
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    x: url.searchParams.get("x"),
    y: url.searchParams.get("y"),
  });
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_QUERY" }, { status: 400 });
  }

  const kakaoKey = process.env.KAKAO_REST_API_KEY;
  if (!kakaoKey) {
    return NextResponse.json({ ok: false, error: "KAKAO_KEY_MISSING" }, { status: 500 });
  }

  const upstream = await fetch(
    `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${parsed.data.x}&y=${parsed.data.y}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `KakaoAK ${kakaoKey}`,
      },
      cache: "no-store",
    },
  );

  const json = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return NextResponse.json(
      { ok: false, error: "KAKAO_UPSTREAM_ERROR", status: upstream.status, body: json },
      { status: 502 },
    );
  }

  const doc = (json?.documents?.[0] ?? null) as any;
  const address =
    doc?.road_address?.address_name ||
    doc?.address?.address_name ||
    null;

  return NextResponse.json({ ok: true, address, raw: doc });
}

