import { NextResponse } from "next/server";
import { z } from "zod";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hammingDistanceHex64 } from "@/lib/imageHash";
import { computePHashHex } from "@/lib/computePHash";
import { haversineMeters } from "@/lib/geo";
import { rateLimit } from "@/lib/rateLimit";

const CreateSchema = z.object({
  type: z.enum(["LOST", "FOUND"]),
  title: z.string().min(2).max(120),
  description: z.string().min(2).max(5000),
  category: z.string().max(60).optional(),
  occurredAt: z.string().datetime(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  locationText: z.string().max(255).optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status") ?? "OPEN";

  const items = await prisma.item.findMany({
    where: {
      ...(type ? { type: type === "LOST" ? "LOST" : "FOUND" } : {}),
      ...(status ? { status: status as any } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      type: true,
      status: true,
      title: true,
      category: true,
      occurredAt: true,
      latitude: true,
      longitude: true,
      locationText: true,
      imagePath: true,
      createdAt: true,
      createdBy: { select: { id: true, displayName: true } },
    },
  });

  return NextResponse.json({ ok: true, items });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const rl = rateLimit(`items:create:${user.id}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "RATE_LIMITED", resetAt: rl.resetAt }, { status: 429 });
  }

  const form = await req.formData();
  const metaRaw = form.get("meta");
  const file = form.get("image");

  if (typeof metaRaw !== "string") {
    return NextResponse.json({ ok: false, error: "INVALID_META" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "INVALID_IMAGE" }, { status: 400 });
  }

  const name = (file as any).name as string | undefined;
  const lowerName = (name ?? "").toLowerCase();
  const mime = (file as any).type as string | undefined;
  const looksLikeHeic =
    mime === "image/heic" ||
    mime === "image/heif" ||
    lowerName.endsWith(".heic") ||
    lowerName.endsWith(".heif");
  if (looksLikeHeic) {
    return NextResponse.json(
      { ok: false, error: "UNSUPPORTED_IMAGE_FORMAT", message: "HEIC/HEIF는 현재 지원하지 않습니다. JPG/PNG로 변환 후 업로드해주세요." },
      { status: 415 },
    );
  }

  const metaJson = JSON.parse(metaRaw) as unknown;
  const parsed = CreateSchema.safeParse(metaJson);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_INPUT" }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const itemId = crypto.randomUUID();
  const outRel = `/uploads/${itemId}.jpg`;
  const outAbs = path.join(process.cwd(), "public", outRel);

  const arrayBuffer = await file.arrayBuffer();
  const input = Buffer.from(arrayBuffer);

  try {
    // Normalize image (strip EXIF, cap size) before hashing.
    await sharp(input)
      .rotate()
      .resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(outAbs);
  } catch (e: any) {
    const msg = typeof e?.message === "string" ? e.message : "";
    if (msg.includes("heif") || msg.includes("heic")) {
      return NextResponse.json(
        { ok: false, error: "UNSUPPORTED_IMAGE_FORMAT", message: "HEIC/HEIF는 현재 지원하지 않습니다. JPG/PNG로 변환 후 업로드해주세요." },
        { status: 415 },
      );
    }
    return NextResponse.json(
      { ok: false, error: "IMAGE_PROCESSING_FAILED", message: "이미지 처리에 실패했습니다. 다른 사진으로 다시 시도해주세요." },
      { status: 400 },
    );
  }

  const imagePHash = await computePHashHex(outAbs);

  // Basic duplicate prevention: same user posting same hash recently (24h)
  const dupSince = new Date(Date.now() - 1000 * 60 * 60 * 24);
  const dup = await prisma.item.findFirst({
    where: { createdById: user.id, imagePHash, createdAt: { gte: dupSince } },
    select: { id: true },
  });
  if (dup) {
    return NextResponse.json({ ok: false, error: "DUPLICATE_IMAGE_RECENT", existingItemId: dup.id }, { status: 409 });
  }

  const created = await prisma.item.create({
    data: {
      id: itemId,
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      occurredAt: new Date(parsed.data.occurredAt),
      latitude: parsed.data.latitude.toFixed(6),
      longitude: parsed.data.longitude.toFixed(6),
      locationText: parsed.data.locationText,
      imagePath: outRel,
      imagePHash,
      createdById: user.id,
    },
    select: {
      id: true,
      type: true,
      status: true,
      title: true,
      description: true,
      category: true,
      occurredAt: true,
      latitude: true,
      longitude: true,
      locationText: true,
      imagePath: true,
      imagePHash: true,
      createdAt: true,
    },
  });

  // Lightweight matching: opposite type, nearby + similar image.
  const opposite = created.type === "LOST" ? "FOUND" : "LOST";
  const lat = Number(created.latitude);
  const lng = Number(created.longitude);
  const maxMeters = 5_000;
  const maxDays = 30;

  const minDate = new Date(created.occurredAt.getTime() - 1000 * 60 * 60 * 24 * maxDays);
  const maxDate = new Date(created.occurredAt.getTime() + 1000 * 60 * 60 * 24 * maxDays);

  // quick bounding box
  const latDelta = maxMeters / 111_000;
  const lngDelta = maxMeters / (111_000 * Math.cos((lat * Math.PI) / 180));

  const candidates = await prisma.item.findMany({
    where: {
      type: opposite as any,
      status: "OPEN",
      occurredAt: { gte: minDate, lte: maxDate },
      latitude: { gte: (lat - latDelta).toFixed(6), lte: (lat + latDelta).toFixed(6) },
      longitude: { gte: (lng - lngDelta).toFixed(6), lte: (lng + lngDelta).toFixed(6) },
    },
    take: 80,
    select: {
      id: true,
      title: true,
      occurredAt: true,
      latitude: true,
      longitude: true,
      locationText: true,
      imagePath: true,
      imagePHash: true,
    },
  });

  const matches = candidates
    .map((c) => {
      const dist = haversineMeters(
        { lat, lng },
        { lat: Number(c.latitude), lng: Number(c.longitude) },
      );
      const ham = hammingDistanceHex64(created.imagePHash, c.imagePHash);
      return { ...c, distanceMeters: dist, hamming: ham };
    })
    .filter((m) => m.distanceMeters <= maxMeters && m.hamming <= 18)
    .sort((a, b) => a.hamming - b.hamming || a.distanceMeters - b.distanceMeters)
    .slice(0, 10);

  return NextResponse.json({ ok: true, item: created, matches });
}

