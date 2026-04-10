import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";

type ItemCard = {
  id: string;
  type: "LOST" | "FOUND";
  title: string;
  occurredAt: Date;
  locationText: string | null;
  imagePath: string;
  createdAt: Date;
};

export default async function Home() {
  const [lostCount, foundCount] = await Promise.all([
    prisma.item.count({ where: { status: "OPEN", type: "LOST" } }),
    prisma.item.count({ where: { status: "OPEN", type: "FOUND" } }),
  ]);

  const items: ItemCard[] = await prisma.item.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      type: true,
      title: true,
      occurredAt: true,
      locationText: true,
      imagePath: true,
      createdAt: true,
    },
  });

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/60 bg-white/70 shadow-xl shadow-blue-100/40 backdrop-blur">
        <div className="absolute inset-0 bg-[radial-gradient(60rem_30rem_at_30%_-10%,rgba(37,99,235,0.10),transparent_60%),radial-gradient(50rem_26rem_at_90%_0%,rgba(99,102,241,0.08),transparent_55%)]" />
        <div className="relative p-8 sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-white/70 px-3 py-1 text-xs text-blue-700 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            사진 · 위치 · 시간 기반 매칭
          </div>
          <div className="mt-4 grid grid-cols-1 items-end gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                분실물과 습득물을
                <span className="block text-zinc-800">가깝고 비슷한 글로 빠르게 연결</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">
                사진 유사도(pHash)와 위치/시간 조건으로 중복을 줄이고, 채팅으로 당사자끼리 바로 확인합니다.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/items/new"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 text-sm font-semibold text-white shadow-sm hover:opacity-95"
                >
                  새 글 등록
                </Link>
                <Link
                  href="/items/new"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
                >
                  지금 바로 매칭 확인
                </Link>
                <div className="flex items-center gap-2 text-xs text-zinc-600">
                  <span className="rounded-full border border-gray-200 bg-white px-2 py-1">분실 {lostCount}</span>
                  <span className="rounded-full border border-gray-200 bg-white px-2 py-1">습득 {foundCount}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200/60 bg-white/70 p-4 backdrop-blur">
              <div className="text-sm font-semibold text-zinc-900">빠른 안내</div>
              <ol className="mt-3 space-y-2 text-sm text-zinc-700">
                <li className="flex gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-xs text-white">
                    1
                  </span>
                  사진 1장 + 위치 + 시간 입력
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-xs text-white">
                    2
                  </span>
                  유사 글 자동 추천 확인
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-xs text-white">
                    3
                  </span>
                  채팅으로 소유자 확인
                </li>
              </ol>
              <div className="mt-4 rounded-xl border border-blue-200/60 bg-blue-50/60 p-3 text-xs text-zinc-700">
                개인정보/금전 요구는 의심 신호입니다. 이상 징후는 신고로 남겨주세요.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">최근 글</h2>
          <p className="mt-1 text-sm text-zinc-600">최신 30건을 보여줍니다.</p>
        </div>
        <Link
          href="/items/new"
          className="hidden rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 sm:inline-flex"
        >
          새 글 쓰기
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-gray-200 bg-white/80 p-8 text-center shadow-sm">
          <div className="text-sm text-zinc-700">아직 등록된 글이 없습니다.</div>
          <div className="mt-4">
            <Link
              href="/items/new"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 text-sm font-semibold text-white shadow-sm hover:opacity-95"
            >
              첫 글 등록하기
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <Link
              key={it.id}
              href={`/items/${it.id}`}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white text-zinc-900 transition hover:shadow-sm"
            >
              <div className="relative aspect-[4/3] bg-zinc-100">
                <Image
                  src={it.imagePath}
                  alt={it.title}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium backdrop-blur">
                  {it.type === "LOST" ? "분실" : "습득"}
                </div>
              </div>
              <div className="p-4">
                <div className="line-clamp-1 font-medium tracking-tight">{it.title}</div>
                <div className="mt-1 text-xs text-zinc-700">
                  {new Date(it.occurredAt).toLocaleString("ko-KR")}
                  {it.locationText ? ` · ${it.locationText}` : ""}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-10 rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-zinc-900">도움이 필요하신가요?</div>
            <div className="mt-1 text-sm text-zinc-600">
              악용/사기 의심, 도용, 반복 게시물은 신고로 남겨주세요.
            </div>
          </div>
          <Link
            href="/report"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            신고 접수
          </Link>
        </div>
      </div>
    </main>
  );
}
