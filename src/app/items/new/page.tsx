import { NewItemForm } from "./new-item-form";

export default function NewItemPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-8 pb-24 bg-[var(--civic-bg)] text-[var(--civic-text)]">
      <div className="mb-10">
        <div className="flex justify-between items-end mb-2">
          <span className="text-[var(--civic-primary)] font-bold text-sm tracking-widest uppercase" style={{ fontFamily: "var(--font-headline)" }}>
            4단계 중 2단계
          </span>
          <span className="text-[var(--civic-muted)] text-xs font-medium tracking-wider uppercase">위치 정보</span>
        </div>
        <div className="w-full h-1 bg-[var(--civic-surface-high)]">
          <div className="h-full bg-[var(--civic-primary)] w-1/2" />
        </div>
      </div>

      {/* 기존 목업 입력 UI 제거: 실제 등록 폼만 사용 */}
      <div className="bg-[var(--civic-surface-lowest)] border border-[var(--civic-border)] p-6">
        <NewItemForm />
      </div>
    </main>
  );
}

