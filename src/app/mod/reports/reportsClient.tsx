"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Report = {
  id: string;
  status: "OPEN" | "REVIEWING" | "ACTIONED" | "DISMISSED";
  targetType: "ITEM" | "MESSAGE" | "USER";
  reason: string;
  createdAt: string;
  reporter: { id: string; displayName: string; email: string };
  item: { id: string; title: string } | null;
  message: { id: string; body: string; senderId: string } | null;
  targetUser: { id: string; displayName: string; email: string } | null;
};

export function ModReportsClient() {
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reports", { cache: "no-store" });
      const json = (await res.json()) as { ok: boolean; reports?: Report[]; error?: string };
      if (!json.ok) {
        setError(json.error ?? "LOAD_FAILED");
        return;
      }
      setReports(json.reports ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-zinc-600">{loading ? "불러오는 중..." : `${reports.length}건`}</div>
        <button
          type="button"
          className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-zinc-50"
          onClick={load}
        >
          새로고침
        </button>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="divide-y rounded-xl border border-zinc-200">
        {reports.map((r) => {
          const target =
            r.targetType === "ITEM" ? (
              r.item ? (
                <Link className="underline" href={`/items/${r.item.id}`}>
                  {r.item.title}
                </Link>
              ) : (
                <span className="text-zinc-500">삭제된 글</span>
              )
            ) : r.targetType === "MESSAGE" ? (
              r.message ? (
                <span className="line-clamp-1">{r.message.body}</span>
              ) : (
                <span className="text-zinc-500">삭제된 메시지</span>
              )
            ) : r.targetUser ? (
              <span>
                {r.targetUser.displayName} ({r.targetUser.email})
              </span>
            ) : (
              <span className="text-zinc-500">삭제된 유저</span>
            );

          return (
            <div key={r.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-zinc-600">
                  <span className="rounded-full border px-2 py-1">{r.status}</span>{" "}
                  <span className="ml-2 rounded-full border px-2 py-1">{r.targetType}</span>{" "}
                  <span className="ml-2">{new Date(r.createdAt).toLocaleString("ko-KR")}</span>
                </div>
                <div className="text-xs text-zinc-600">
                  신고자: {r.reporter.displayName} ({r.reporter.email})
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className="font-medium">대상</span>: {target}
              </div>
              <div className="mt-2 whitespace-pre-wrap rounded-md bg-zinc-50 p-3 text-sm text-zinc-800">
                {r.reason}
              </div>
              <div className="mt-3 text-xs text-zinc-500">조치 API는 다음 단계에서 연결합니다(밴/삭제/상태 변경).</div>
            </div>
          );
        })}
        {reports.length === 0 ? <div className="p-4 text-sm text-zinc-600">신고가 없습니다.</div> : null}
      </div>
    </div>
  );
}

