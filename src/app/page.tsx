import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function Home() {
  const [openTotal, resolvedTotal] = await Promise.all([
    prisma.item.count({ where: { status: "OPEN" } }),
    prisma.item.count({ where: { status: "RESOLVED" } }),
  ]);
  const items = await prisma.item.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    take: 12,
    select: {
      id: true,
      type: true,
      title: true,
      locationText: true,
      occurredAt: true,
      imagePath: true,
    },
  });
  const reunitedRate = openTotal + resolvedTotal > 0 ? Math.round((resolvedTotal / (openTotal + resolvedTotal)) * 100) : 0;

  return (
    <div className="bg-[var(--civic-bg)] text-[var(--civic-text)] min-h-screen">
      <main className="max-w-7xl mx-auto px-6 py-8 pb-24">
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div
              className="lg:col-span-2 bg-[var(--civic-primary)] p-8 md:p-12 flex flex-col justify-end min-h-[400px] relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, var(--civic-primary) 0%, var(--civic-primary-container) 100%)" }}
            >
              <div className="relative z-10">
                <span className="text-white/70 text-sm tracking-[0.2em] uppercase mb-4 block">분실물 찾기 도우미</span>
                <h1 className="text-white text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-6" style={{ fontFamily: "var(--font-headline)" }}>
                  내 물건,
                  <br />
                  다시 찾기
                </h1>
                <p className="text-white/70 max-w-md text-lg leading-relaxed">
                  사진과 위치, 시간 정보를 바탕으로 비슷한 글을 찾아보고 빠르게 연락할 수 있어요.
                </p>
              </div>
            </div>

            <div className="bg-[var(--civic-surface-high)] p-8 flex flex-col justify-between border-b-4 border-[var(--civic-primary)]">
              <div>
                <h2 className="text-[var(--civic-primary)] font-bold text-2xl tracking-tight mb-4 uppercase" style={{ fontFamily: "var(--font-headline)" }}>
                  안내
                </h2>
                <ul className="space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 bg-[var(--civic-primary)]" />
                    <span className="font-medium leading-tight">인계 전, 공개 글에 없는 “비공개 특징 1가지”를 상호 확인하세요.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 bg-[var(--civic-primary)]" />
                    <span className="font-medium leading-tight">금전 요구·개인정보 유도는 의심 신호입니다. 즉시 신고하세요.</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/items/new"
                className="bg-[var(--civic-primary)] text-white w-full py-4 font-bold tracking-widest uppercase text-sm mt-8 hover:bg-[var(--civic-primary-container)] transition-colors text-center"
              >
                새 글 등록
              </Link>
            </div>
          </div>
        </section>

        <div className="bg-[var(--civic-surface-low)] mb-12 p-1 flex flex-col md:flex-row gap-4 items-stretch border-b-2 border-[var(--civic-primary)]">
          <div className="flex-1 flex items-center px-4 py-2">
            <input
              className="bg-transparent border-none focus:ring-0 w-full text-xs tracking-widest uppercase placeholder:text-slate-500"
              placeholder="물품명/장소/키워드로 검색(목업)"
              type="text"
            />
          </div>
          <div className="flex border-t md:border-t-0 md:border-l border-[var(--civic-border)]">
            <button className="px-6 py-4 text-xs tracking-widest uppercase hover:bg-[var(--civic-surface-high)] transition-colors">위치</button>
            <button className="px-6 py-4 text-xs tracking-widest uppercase bg-[var(--civic-primary)] text-white">검색</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((it) => (
            <Link key={it.id} href={`/items/${it.id}`} className="bg-[var(--civic-surface-lowest)] group cursor-pointer border-t-2 border-transparent hover:border-[var(--civic-primary)] transition-all">
              <div className="aspect-square relative overflow-hidden bg-[var(--civic-surface-high)]">
                {it.imagePath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.imagePath} alt={it.title} className="absolute inset-0 h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                ) : (
                  <div className="absolute inset-0 bg-slate-200" />
                )}
                <div className="absolute top-0 right-0 bg-[var(--civic-primary)] text-white px-3 py-1 text-[10px] tracking-widest uppercase">
                  {it.type === "LOST" ? "분실" : "습득"}
                </div>
              </div>
              <div className="p-5">
                <span className="text-xs tracking-widest text-slate-500 uppercase mb-2 block">번호: {it.id.slice(0, 8)}</span>
                <h3 className="text-[var(--civic-text)] font-bold text-lg leading-tight mb-4">{it.title}</h3>
                <div className="space-y-2 border-t border-[var(--civic-border)] pt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 bg-[var(--civic-primary)]" />
                    <span className="font-medium">{it.locationText ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="h-3 w-3 bg-slate-400" />
                    <span>{new Date(it.occurredAt).toLocaleString("ko-KR")}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <section className="mt-16 bg-[var(--civic-text)] p-12 text-white grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <span className="text-xs tracking-[0.3em] uppercase opacity-60 mb-2 block">진행 중 기록</span>
            <span className="text-5xl font-black tracking-tighter">{openTotal}</span>
          </div>
          <div>
            <span className="text-xs tracking-[0.3em] uppercase opacity-60 mb-2 block">해결(누적)</span>
            <span className="text-5xl font-black tracking-tighter">{reunitedRate}%</span>
          </div>
          <div>
            <span className="text-xs tracking-[0.3em] uppercase opacity-60 mb-2 block">처리 센터</span>
            <span className="text-5xl font-black tracking-tighter">14</span>
          </div>
        </section>

        <Link
          href="/items/new"
          className="fixed bottom-24 right-8 bg-[var(--civic-primary)] text-white w-14 h-14 flex items-center justify-center shadow-[0px_12px_32px_rgba(13,28,46,0.06)] hover:bg-[var(--civic-primary-container)] transition-colors z-40"
          aria-label="새 글 등록"
        >
          +
        </Link>
      </main>

      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-16 bg-white shadow-[0px_-12px_32px_rgba(13,28,46,0.06)] z-50">
        <Link className="flex flex-col items-center justify-center bg-[var(--civic-primary-container)] text-white px-6 py-2" href="/">
          <span className="text-[11px] font-bold tracking-widest uppercase">홈</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-[var(--civic-text)] opacity-50 px-6 py-2 hover:opacity-100" href="/items/new">
          <span className="text-[11px] font-bold tracking-widest uppercase">등록</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-[var(--civic-text)] opacity-50 px-6 py-2 hover:opacity-100" href="/threads/mock">
          <span className="text-[11px] font-bold tracking-widest uppercase">채팅</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-[var(--civic-text)] opacity-50 px-6 py-2 hover:opacity-100" href="/report">
          <span className="text-[11px] font-bold tracking-widest uppercase">신고</span>
        </Link>
      </nav>
    </div>
  );
}
