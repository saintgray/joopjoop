import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ThreadClient } from "./thread-client";

export default async function ThreadPage(props: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <div className="rounded-lg border border-[var(--civic-border)] bg-white p-5 text-sm text-[var(--civic-text)]">
          로그인 후 이용해주세요. <Link className="underline" href="/login">로그인</Link>
        </div>
      </main>
    );
  }

  const { id } = await props.params;
  const thread = await prisma.chatThread.findUnique({
    where: { id },
    select: {
      id: true,
      userAId: true,
      userBId: true,
      item: { select: { id: true, title: true } },
    },
  });
  if (!thread) return notFound();
  if (thread.userAId !== user.id && thread.userBId !== user.id) return notFound();

  const otherUserId = thread.userAId === user.id ? thread.userBId : thread.userAId;
  const otherUser = await prisma.user.findUnique({
    where: { id: otherUserId },
    select: { displayName: true },
  });

  return (
    <main className="min-h-screen flex flex-col bg-[var(--civic-bg)] text-[var(--civic-text)]">
      <div className="bg-[var(--civic-surface-low)] px-6 py-3 border-b border-[var(--civic-border)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[var(--civic-surface-highest)] overflow-hidden" />
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--civic-muted)] mb-1">물품 문의</p>
            <h2 className="text-[var(--civic-text)] font-bold text-sm leading-tight">
              <Link className="hover:underline" href={`/items/${thread.item.id}`}>
                {thread.item.title}
              </Link>
            </h2>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] bg-[#4f2e00] text-white px-2 py-1 font-bold uppercase tracking-tighter">
            상대: {otherUser?.displayName ?? "상대"}
          </span>
          <p className="text-[10px] text-[var(--civic-muted)] font-medium mt-1">스레드: {thread.id.slice(0, 8)}</p>
        </div>
      </div>

      <div className="flex-grow max-w-4xl mx-auto w-full px-4 pt-4 pb-24">
        <div className="rounded-lg border border-[var(--civic-border)] bg-white text-[var(--civic-text)]">
          <ThreadClient threadId={thread.id} meId={user.id} />
        </div>
      </div>
    </main>
  );
}

