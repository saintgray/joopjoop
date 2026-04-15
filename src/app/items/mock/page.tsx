import Link from "next/link";

export default function MockItemDetailsPage() {
  // Static mock based on Stitch export: item_details_joopjoop_public_style
  return (
    <div className="bg-[var(--civic-bg)] text-[var(--civic-text)] min-h-screen pb-24">
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-[var(--civic-surface-lowest)] overflow-hidden">
              <div className="aspect-[16/10] w-full relative">
                <div className="absolute inset-0 bg-slate-200" />
                <div className="absolute top-4 left-4 bg-[var(--civic-primary)] text-white px-3 py-1 text-xs tracking-widest uppercase">
                  습득 #48291
                </div>
              </div>
            </section>

            <section className="bg-[var(--civic-surface-low)] p-8 space-y-6">
              <div className="flex justify-between items-start border-b border-[var(--civic-border)] pb-6">
                <div className="space-y-1">
                  <p className="text-[10px] tracking-widest uppercase text-[var(--civic-muted)] mb-1">카테고리: 소지품</p>
                  <h2 className="text-[var(--civic-primary)] text-3xl font-bold tracking-tight">검정 가죽 지갑</h2>
                </div>
                <div className="bg-[#4f2e00] text-white px-4 py-2 text-sm font-bold tracking-tight">확인 대기</div>
              </div>

              <div className="grid grid-cols-2 gap-8 py-4">
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-slate-500">발견한 날짜</p>
                  <p className="font-bold">2023.10.24</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-slate-500">장소</p>
                  <p className="font-bold">강남역 11번 출구</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] tracking-widest uppercase text-slate-500">상세 설명</p>
                <p className="text-[var(--civic-muted)] leading-relaxed text-sm">
                  11번 출구 입구 근처에서 검정 가죽 지갑을 습득했습니다. 카드가 몇 장 들어있고 현금은 없었습니다.
                </p>
              </div>
            </section>

            <section className="bg-[var(--civic-surface-low)] p-1 overflow-hidden">
              <div className="h-64 w-full relative bg-[var(--civic-surface-high)]">
                <div className="absolute inset-0 bg-[var(--civic-primary)]/5 pointer-events-none" />
                <div className="absolute bottom-4 right-4 bg-[var(--civic-surface-lowest)] px-4 py-2 font-bold text-xs tracking-tighter text-[var(--civic-primary)] flex items-center gap-2">
                  지도 크게 보기
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <div className="flex flex-col gap-3">
              <Link
                href="/threads/mock"
                className="w-full bg-[var(--civic-primary)] text-white py-5 font-bold tracking-widest uppercase flex items-center justify-center gap-2"
              >
                채팅 시작
              </Link>
              <Link
                href="/report"
                className="w-full bg-[var(--civic-surface-highest)] text-[var(--civic-text)] py-5 font-bold tracking-widest uppercase flex items-center justify-center gap-2"
              >
                신고하기
              </Link>
            </div>

            <div className="bg-[var(--civic-surface-lowest)] p-6 outline outline-1 outline-[var(--civic-border)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[var(--civic-primary)] font-bold text-lg tracking-tight">추천 매칭(목업)</h3>
                <span className="bg-[var(--civic-primary-container)] text-white text-[10px] font-bold px-2 py-0.5">AI</span>
              </div>
              <div className="space-y-4 text-sm">
                {[
                  ["유사도 94%", "분실: 남성 반지갑", "약 250m · 2시간 전"],
                  ["유사도 81%", "분실: 네이비 카드지갑", "약 1.2km · 5시간 전"],
                  ["유사도 76%", "분실: 디자이너 파우치", "약 3.0km · 어제"],
                ].map(([s, t, m]) => (
                  <div key={t} className="flex gap-4 p-2 hover:bg-[var(--civic-surface-low)] transition-colors">
                    <div className="w-20 h-20 bg-[var(--civic-surface-high)]" />
                    <div className="flex flex-col justify-center gap-1">
                      <span className="font-black text-xs">{s}</span>
                      <h4 className="font-bold text-sm">{t}</h4>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{m}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-3 border border-[var(--civic-border)] text-[10px] font-bold tracking-widest uppercase text-slate-500 hover:text-[var(--civic-primary)] transition-all">
                추천 매칭 더 보기(목업)
              </button>
            </div>

            <div className="p-6 bg-[var(--civic-primary-container)] text-white flex gap-4 items-start">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider">안전하게 인계하기</p>
                <p className="text-[11px] leading-tight opacity-80">
                  공개 글에 없는 “비공개 특징 1가지”를 서로 확인한 뒤 직접 인계하세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

