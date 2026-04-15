import Link from "next/link";

export default function MockChatPage() {
  // Static mock based on Stitch export: chat_joopjoop_public_style
  return (
    <div className="bg-[var(--civic-bg)] text-[var(--civic-text)] min-h-screen flex flex-col">
      <div className="bg-[var(--civic-surface-low)] px-6 py-3 border-b border-[var(--civic-border)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[var(--civic-surface-highest)]" />
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--civic-muted)] mb-1">물품 문의(목업)</p>
            <h2 className="font-bold text-sm leading-tight">Vintage Leather Satchel #8821</h2>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] bg-[#4f2e00] text-white px-2 py-1 font-bold uppercase tracking-tighter">상태: 분실</span>
          <p className="text-[10px] text-[var(--civic-muted)] font-medium mt-1">참조: L-29401</p>
        </div>
      </div>

      <main className="flex-grow flex flex-col max-w-4xl mx-auto w-full px-4 pt-8 pb-24 overflow-y-auto">
        <div className="flex justify-center mb-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 px-4 py-1 bg-[var(--civic-surface-high)]">오늘</span>
        </div>

        <div className="flex flex-col items-start mb-6 max-w-[85%]">
          <div className="flex items-center gap-2 mb-1 px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--civic-primary)]">관리자(목업)</span>
            <span className="text-[9px] text-slate-500 font-medium">10:14</span>
          </div>
          <div className="bg-[var(--civic-surface-low)] text-[var(--civic-text)] px-4 py-3 border-l-4 border-[var(--civic-primary)]">
            <p className="text-sm leading-relaxed">앞주머니 안쪽에 식별 가능한 표시가 있는지 확인 부탁드립니다.</p>
          </div>
        </div>

        <div className="flex flex-col items-end mb-6 max-w-[85%] ml-auto">
          <div className="flex items-center gap-2 mb-1 px-1 justify-end">
            <span className="text-[9px] text-slate-500 font-medium">10:16</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--civic-muted)]">나</span>
          </div>
          <div className="bg-[var(--civic-primary)] text-white px-4 py-3">
            <p className="text-sm leading-relaxed">네. 지퍼 라인 근처에 작은 잉크 얼룩과 “M.A.” 금박 각인이 있어요.</p>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full z-50">
        <div className="bg-[var(--civic-surface-lowest)] border-t border-[var(--civic-border)] px-4 py-4 md:px-8">
          <div className="max-w-4xl mx-auto flex items-end gap-4">
            <button className="mb-2 p-2 hover:bg-[var(--civic-surface-high)] transition-colors text-slate-500" type="button">
              +
            </button>
            <div className="flex-grow relative">
              <textarea
                className="w-full bg-[var(--civic-surface-low)] border-b-2 border-[var(--civic-primary)] focus:ring-0 text-sm py-3 px-4 placeholder:text-slate-500 resize-none overflow-hidden"
                placeholder="메시지를 입력하세요..."
                rows={1}
              />
            </div>
            <button className="bg-[var(--civic-primary)] text-white px-6 py-3 font-bold uppercase tracking-widest text-[11px]" type="button">
              전송
            </button>
          </div>
        </div>

        <div className="md:hidden flex justify-around items-center h-16 bg-white shadow-[0px_-12px_32px_rgba(13,28,46,0.06)]">
          <Link className="flex flex-col items-center justify-center text-[var(--civic-text)] opacity-50 px-6 py-2 hover:opacity-100" href="/">
            <span className="text-[11px] font-bold tracking-widest uppercase">홈</span>
          </Link>
          <Link className="flex flex-col items-center justify-center text-[var(--civic-text)] opacity-50 px-6 py-2 hover:opacity-100" href="/items/new">
            <span className="text-[11px] font-bold tracking-widest uppercase">등록</span>
          </Link>
          <Link className="flex flex-col items-center justify-center bg-[var(--civic-primary-container)] text-white px-6 py-2" href="/threads/mock">
            <span className="text-[11px] font-bold tracking-widest uppercase">채팅</span>
          </Link>
          <Link className="flex flex-col items-center justify-center text-[var(--civic-text)] opacity-50 px-6 py-2 hover:opacity-100" href="/report">
            <span className="text-[11px] font-bold tracking-widest uppercase">신고</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}

