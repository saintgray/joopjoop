"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export function ReportForm(props: { searchParams: Promise<{ type?: string; id?: string }> }) {
  const router = useRouter();
  const [targetType, setTargetType] = useState<"ITEM" | "MESSAGE" | "USER">("ITEM");
  const [targetId, setTargetId] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useMemo(() => {
    void props.searchParams.then((sp) => {
      const t = sp.type;
      const id = sp.id;
      if (t === "ITEM" || t === "MESSAGE" || t === "USER") setTargetType(t);
      if (typeof id === "string") setTargetId(id);
    });
  }, [props.searchParams]);

  const canSubmit = reason.trim().length >= 3 && !!targetId;

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!canSubmit || loading) return;
        setLoading(true);
        setError(null);
        setOk(false);
        try {
          const res = await fetch("/api/reports", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ targetType, targetId, reason }),
          });
          const json = (await res.json()) as { ok: boolean; error?: string };
          if (!json.ok) {
            setError(json.error ?? "REPORT_FAILED");
            return;
          }
          setOk(true);
          setReason("");
        } finally {
          setLoading(false);
        }
      }}
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium text-zinc-700">대상</span>
        <select value={targetType} onChange={(e) => setTargetType(e.target.value as any)} className="h-10 rounded-md border px-3">
          <option value="ITEM">글</option>
          <option value="MESSAGE">메시지</option>
          <option value="USER">유저</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium text-zinc-700">대상 ID</span>
        <input value={targetId} onChange={(e) => setTargetId(e.target.value)} className="h-10 rounded-md border px-3" placeholder="자동으로 채워질 수 있어요" required />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium text-zinc-700">사유</span>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-28 rounded-md border px-3 py-2" placeholder="예: 동일 사진으로 반복 업로드, 금전 요구, 개인정보 유도..." required />
      </label>

      <div className="flex gap-2">
        <button disabled={!canSubmit || loading} className="h-11 flex-1 rounded-md bg-zinc-900 text-sm font-medium text-white disabled:opacity-60">
          {loading ? "전송 중..." : "신고 접수"}
        </button>
        <button type="button" className="h-11 rounded-md border bg-white px-4 text-sm hover:bg-zinc-50" onClick={() => router.back()}>
          뒤로
        </button>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      ) : null}
      {ok ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          접수되었습니다. 검토 후 조치됩니다.
        </div>
      ) : null}
    </form>
  );
}

