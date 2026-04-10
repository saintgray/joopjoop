import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

const PostSchema = z.object({
  body: z.string().min(1).max(2000),
});

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await ctx.params;

  const thread = await prisma.chatThread.findUnique({
    where: { id },
    select: { id: true, userAId: true, userBId: true },
  });
  if (!thread || (thread.userAId !== user.id && thread.userBId !== user.id)) {
    return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { threadId: id },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: {
      id: true,
      body: true,
      createdAt: true,
      senderId: true,
      sender: { select: { displayName: true } },
    },
  });

  return NextResponse.json({ ok: true, messages });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const rl = rateLimit(`chat:send:${user.id}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "RATE_LIMITED", resetAt: rl.resetAt }, { status: 429 });
  }

  const { id } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = PostSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_INPUT" }, { status: 400 });
  }

  const thread = await prisma.chatThread.findUnique({
    where: { id },
    select: { id: true, userAId: true, userBId: true },
  });
  if (!thread || (thread.userAId !== user.id && thread.userBId !== user.id)) {
    return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
  }

  const message = await prisma.chatMessage.create({
    data: { threadId: id, senderId: user.id, body: parsed.data.body },
    select: { id: true, body: true, createdAt: true, senderId: true },
  });

  await prisma.chatThread.update({ where: { id }, data: { updatedAt: new Date() } });

  return NextResponse.json({ ok: true, message });
}

