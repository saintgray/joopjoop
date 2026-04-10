import Image from "next/image";
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
  const opposite = item.type === "LOST" ? "FOUND" : "LOST";

  const candidates = await prisma.item.findMany({
    where: { type: opposite as any, status: "OPEN" },
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
      const ham = hammingDistanceHex64(item.imagePHash, c.imagePHash);
      return { ...c, distanceMeters: dist, hamming: ham };
    })
    .filter((m) => m.hamming <= 18)
    .sort((a, b) => a.hamming - b.hamming || a.distanceMeters - b.distanceMeters)
    .slice(0, 6);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white text-zinc-900">
          <div className="relative aspect-[4/3] bg-zinc-100">
            <Image src={item.imagePath} alt={item.title} fill className="object-cover" />
          </div>
          <div className="p-5">
            <div className="text-xs text-zinc-600">
              {item.type === "LOST" ? "분실" : "습득"} · {new Date(item.occurredAt).toLocaleString("ko-KR")}
            </div>
            <h1 className="mt-1 text-xl font-semibold tracking-tight">{item.title}</h1>
            <div className="mt-2 whitespace-pre-wrap text-sm text-zinc-800">{item.description}</div>
            <div className="mt-3 text-xs text-zinc-600">
              작성자: {item.createdBy.displayName}
              {item.locationText ? ` · 장소: ${item.locationText}` : ""}
            </div>
            <div className="mt-4">
              <KakaoMapView lat={lat} lng={lng} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-white/10 bg-white p-5 text-zinc-900">
            <div className="text-sm font-semibold">추천 매칭</div>
            <div className="mt-1 text-xs text-zinc-600">
              사진 유사도(pHash) + 거리 기준으로 근접 글을 보여줍니다.
            </div>

            {matches.length === 0 ? (
              <div className="mt-4 text-sm text-zinc-600">아직 유사한 글이 없어요.</div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {matches.map((m) => (
                  <Link key={m.id} href={`/items/${m.id}`} className="overflow-hidden rounded-xl border hover:shadow-sm">
                    <div className="relative aspect-[4/3] bg-zinc-100">
                      <Image src={m.imagePath} alt={m.title} fill className="object-cover" />
                    </div>
                    <div className="p-3">
                      <div className="line-clamp-1 text-sm font-medium">{m.title}</div>
                      <div className="mt-1 text-[11px] text-zinc-600">
                        hamming {m.hamming} · {Math.round(m.distanceMeters)}m ·{" "}
                        {new Date(m.occurredAt).toLocaleDateString("ko-KR")}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white p-5 text-zinc-900">
            <div className="text-sm font-semibold">연락하기</div>
            <div className="mt-1 text-xs text-zinc-600">
              글 작성자에게 채팅으로 문의할 수 있어요.
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {!user ? (
                <Link className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-zinc-50" href="/login">
                  로그인 후 채팅
                </Link>
              ) : user.id === item.createdById ? (
                <div className="text-sm text-zinc-600">내가 작성한 글입니다.</div>
              ) : (
                <StartChatButton itemId={item.id} />
              )}
              <Link
                className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-zinc-50"
                href={`/report?type=ITEM&id=${item.id}`}
              >
                이 글 신고
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white p-5 text-zinc-900">
            <div className="text-sm font-semibold">다음 단계(미구현)</div>
            <ul className="mt-2 list-disc pl-5 text-sm text-zinc-700">
              <li>채팅 연결 및 신고/모더레이션</li>
              <li>악용 방지(레이트리밋, 중복 업로드 탐지)</li>
              <li>지도 UI 및 반경/시간 필터</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

