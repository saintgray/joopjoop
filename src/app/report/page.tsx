import { ReportForm } from "./report-form";

export default function ReportPage(props: { searchParams: Promise<{ type?: string; id?: string }> }) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-tighter text-[var(--civic-text)]" style={{ fontFamily: "var(--font-headline)" }}>
          신고
        </h1>
        <p className="mt-2 text-sm text-[var(--civic-muted)]">악용/사기/도용 등의 정황을 구체적으로 적어주세요.</p>
      </div>

      <div className="mx-auto mt-8 max-w-xl bg-[var(--civic-surface-lowest)] p-6">
        <div className="border border-[var(--civic-border)] bg-[var(--civic-surface-lowest)] p-6">
          <ReportForm searchParams={props.searchParams} />
        </div>
      </div>
    </main>
  );
}

