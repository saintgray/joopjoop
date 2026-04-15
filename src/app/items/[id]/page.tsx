import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hammingDistanceHex64 } from "@/lib/imageHash";
import { haversineMeters } from "@/lib/geo";
import { StartChatButton } from "./start-chat-button";
import { KakaoMapView } from "./kakao-map-view";

export default async function ItemDetailPage(props: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  const { id } = await props.params;

  const item = await prisma.item.findUnique({
    where: { id },
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
      createdById: true,
      createdBy: { select: { displayName: true } },
    },
  });
  if (!item) return notFound();

  const lat = Number(item.latitude);
  const lng = Number(item.longitude);
  const opposite: "LOST" | "FOUND" = item.type === "LOST" ? "FOUND" : "LOST";

  const candidates = await prisma.item.findMany({
    where: { type: opposite, status: "OPEN" },
    take: 80,
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, imagePath: true, imagePHash: true, latitude: true, longitude: true, occurredAt: true },
  });

  const matches = candidates
    .map((c) => {
      const dist = haversineMeters(
        { lat, lng },
        { lat: Number(c.latitude), lng: Number(c.longitude) },
      );
      const ham = item.imagePHash && c.imagePHash ? hammingDistanceHex64(item.imagePHash, c.imagePHash) : 999;
      return { ...c, distanceMeters: dist, hamming: ham };
    })
    .filter((m) => !item.imagePHash || m.hamming <= 18)
    .sort((a, b) => a.hamming - b.hamming || a.distanceMeters - b.distanceMeters)
    .slice(0, 6);

  return (
    <main className="bg-[var(--civic-bg)] text-[var(--civic-text)] min-h-screen pb-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-[var(--civic-surface-lowest)] overflow-hidden">
              <div className="aspect-[16/10] w-full relative group">
                {item.imagePath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt={item.title} className="w-full h-full object-cover" src={item.imagePath} />
                ) : (
                  <div className="w-full h-full bg-[var(--civic-surface-high)]" />
                )}
                <div className="absolute top-4 left-4 bg-[var(--civic-primary)] text-white px-3 py-1 text-xs tracking-widest uppercase">
                  {item.type === "FOUND" ? "습득" : "분실"} #{item.id.slice(0, 5)}
                </div>
              </div>
            </section>

            <section className="bg-[var(--civic-surface-low)] p-8 space-y-6">
              <div className="flex justify-between items-start border-b border-[var(--civic-border)] pb-6">
                <div className="space-y-1">
                  <p className="text-[10px] tracking-widest uppercase text-[var(--civic-muted)] mb-1">
                    카테고리: {item.category ?? "미분류"}
                  </p>
                  <h2 className="text-[var(--civic-primary)] text-3xl font-bold tracking-tight">{item.title}</h2>
                </div>
                <div className="bg-[#4f2e00] text-white px-4 py-2 text-sm font-bold tracking-tight">
                  {item.status === "OPEN" ? "진행 중" : item.status === "RESOLVED" ? "해결" : item.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 py-4">
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-[10px] tracking-widest uppercase text-slate-500">날짜</p>
                    <p className="font-bold">{new Date(item.occurredAt).toLocaleDateString("ko-KR")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-[10px] tracking-widest uppercase text-slate-500">장소</p>
                    <p className="font-bold">{item.locationText ?? "—"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] tracking-widest uppercase text-slate-500">상세 설명</p>
                <p className="text-[var(--civic-muted)] leading-relaxed text-sm whitespace-pre-wrap">{item.description}</p>
              </div>
            </section>

            <section className="bg-[var(--civic-surface-low)] p-1 overflow-hidden">
              <div className="h-64 w-full relative">
                <div className="w-full h-full">
                  <KakaoMapView lat={lat} lng={lng} />
                </div>
                <div className="absolute bottom-4 right-4 bg-[var(--civic-surface-lowest)] px-4 py-2 font-bold text-xs tracking-tighter text-[var(--civic-primary)] flex items-center gap-2">
                  지도로 크게 보기
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 space-y-8">
            {user?.id === item.createdById ? null : (
              <div className="flex flex-col gap-3">
                {!user ? (
                  <Link
                    href="/login"
                    className="w-full bg-[var(--civic-primary)] text-white py-5 font-bold tracking-widest uppercase flex items-center justify-center gap-2"
                  >
                    로그인 후 채팅
                  </Link>
                ) : (
                  <StartChatButton itemId={item.id} />
                )}
                <Link
                  href={`/report?type=ITEM&id=${item.id}`}
                  className="w-full bg-[var(--civic-surface-highest)] text-[var(--civic-text)] py-5 font-bold tracking-widest uppercase flex items-center justify-center gap-2"
                >
                  신고하기
                </Link>
              </div>
            )}

            <div className="bg-[var(--civic-surface-lowest)] p-6 outline outline-1 outline-[var(--civic-border)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[var(--civic-primary)] font-bold text-lg tracking-tight">추천 매칭</h3>
                <span className="bg-[var(--civic-primary-container)] text-white text-[10px] font-bold px-2 py-0.5">AI</span>
              </div>

              {matches.length === 0 ? (
                <div className="text-sm text-[var(--civic-muted)]">추천 매칭이 없습니다.</div>
              ) : (
                <div className="space-y-4">
                  {matches.map((m) => (
                    <Link key={m.id} href={`/items/${m.id}`} className="flex gap-4 p-2 hover:bg-[var(--civic-surface-low)] transition-colors">
                      <div className="w-20 h-20 flex-shrink-0 bg-[var(--civic-surface-high)] overflow-hidden">
                        {m.imagePath ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img alt={m.title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" src={m.imagePath} />
                        ) : null}
                      </div>
                      <div className="flex flex-col justify-center gap-1">
                        <span className="font-black text-xs">유사도 {Math.max(0, 100 - m.hamming * 4)}%</span>
                        <h4 className="font-bold text-sm text-[var(--civic-text)]">{m.title}</h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                          약 {Math.round(m.distanceMeters)}m • {new Date(m.occurredAt).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <button className="w-full mt-6 py-3 border border-[var(--civic-border)] text-[10px] font-bold tracking-widest uppercase text-slate-500 hover:text-[var(--civic-primary)] transition-all">
                추천 매칭 더 보기(목업)
              </button>
            </div>

            <div className="p-6 bg-[var(--civic-primary-container)] text-white flex gap-4 items-start">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider">안전하게 인계하기</p>
                <p className="text-[11px] leading-tight opacity-80">
                  비공개 특징 1가지를 서로 확인한 뒤 직접 인계를 권장합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

