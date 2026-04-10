import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const CreateSchema = z.object({
  targetType: z.enum(["ITEM", "MESSAGE", "USER"]),
  targetId: z.string().min(1),
  reason: z.string().min(3).max(2000),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_INPUT" }, { status: 400 });
  }

  const data: any = {
    targetType: parsed.data.targetType,
    reason: parsed.data.reason,
    reporterId: user.id,
  };

  if (parsed.data.targetType === "ITEM") {
    data.itemId = parsed.data.targetId;
  } else if (parsed.data.targetType === "MESSAGE") {
    data.messageId = parsed.data.targetId;
  } else {
    data.targetUserId = parsed.data.targetId;
  }

  try {
    const report = await prisma.report.create({
      data,
      select: { id: true, status: true, createdAt: true },
    });
    return NextResponse.json({ ok: true, report });
  } catch {
    return NextResponse.json({ ok: false, error: "REPORT_FAILED" }, { status: 400 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (user.role !== "ADMIN" && user.role !== "MOD") {
    return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
  }

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      status: true,
      targetType: true,
      reason: true,
      createdAt: true,
      reporter: { select: { id: true, displayName: true, email: true } },
      item: { select: { id: true, title: true } },
      message: { select: { id: true, body: true, senderId: true } },
      targetUser: { select: { id: true, displayName: true, email: true } },
    },
  });

  return NextResponse.json({ ok: true, reports });
}

