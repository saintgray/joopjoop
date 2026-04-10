import { ReportForm } from "./report-form";

export default function ReportPage(props: { searchParams: Promise<{ type?: string; id?: string }> }) {
  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">신고</h1>
      <p className="mt-2 text-sm text-zinc-600">악용/사기/도용 등의 정황을 구체적으로 적어주세요.</p>
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white/90 p-5 text-zinc-900 shadow-sm">
        <ReportForm searchParams={props.searchParams} />
      </div>
    </main>
  );
}

