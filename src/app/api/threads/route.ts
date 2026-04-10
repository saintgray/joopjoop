import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const CreateSchema = z.object({
  itemId: z.string().min(1),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const threads = await prisma.chatThread.findMany({
    where: { OR: [{ userAId: user.id }, { userBId: user.id }] },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: {
      id: true,
      updatedAt: true,
      item: { select: { id: true, title: true, imagePath: true, type: true, status: true } },
      messages: { take: 1, orderBy: { createdAt: "desc" }, select: { body: true, createdAt: true, senderId: true } },
    },
  });

  return NextResponse.json({ ok: true, threads });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_INPUT" }, { status: 400 });
  }

  const item = await prisma.item.findUnique({
    where: { id: parsed.data.itemId },
    select: { id: true, status: true, createdById: true },
  });
  if (!item || item.status !== "OPEN") {
    return NextResponse.json({ ok: false, error: "ITEM_NOT_AVAILABLE" }, { status: 400 });
  }

  const otherUserId = item.createdById;
  if (otherUserId === user.id) {
    return NextResponse.json({ ok: false, error: "CANNOT_CHAT_SELF" }, { status: 400 });
  }

  const [userAId, userBId] = user.id < otherUserId ? [user.id, otherUserId] : [otherUserId, user.id];

  const thread = await prisma.chatThread.upsert({
    where: { itemId_userAId_userBId: { itemId: item.id, userAId, userBId } },
    create: { itemId: item.id, userAId, userBId },
    update: { updatedAt: new Date() },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, thread });
}

