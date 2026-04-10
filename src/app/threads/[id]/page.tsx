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
        <div className="rounded-2xl border border-gray-200 bg-white/90 p-5 text-sm text-zinc-900 shadow-sm">
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
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-zinc-600">
            글:{" "}
            <Link className="underline" href={`/items/${thread.item.id}`}>
              {thread.item.title}
            </Link>
          </div>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">
            {otherUser?.displayName ?? "상대"} 님과의 채팅
          </h1>
        </div>
        <Link className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-zinc-900 hover:bg-zinc-50" href="/">
          홈
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white/90 text-zinc-900 shadow-sm">
        <ThreadClient threadId={thread.id} meId={user.id} />
      </div>
    </main>
  );
}

