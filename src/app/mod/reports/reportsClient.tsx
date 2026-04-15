"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toKoreanMessage } from "@/lib/userMessages";

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
  const [filter, setFilter] = useState<"NEWEST" | "OPEN_ONLY">("NEWEST");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reports", { cache: "no-store" });
      const json = (await res.json()) as { ok: boolean; reports?: Report[]; error?: string };
      if (!json.ok) {
        setError(toKoreanMessage(json.error ?? "LOAD_FAILED"));
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

  const stats = (() => {
    const open = reports.filter((r) => r.status === "OPEN").length;
    const reviewing = reports.filter((r) => r.status === "REVIEWING").length;
    const actioned = reports.filter((r) => r.status === "ACTIONED").length;
    const dismissed = reports.filter((r) => r.status === "DISMISSED").length;
    return { open, reviewing, actioned, dismissed, total: reports.length };
  })();

  const shown =
    filter === "OPEN_ONLY"
      ? reports.filter((r) => r.status === "OPEN" || r.status === "REVIEWING")
      : reports;

  function badgeFor(r: Report): { label: string; className: string } {
    if (r.targetType === "ITEM") return { label: "글", className: "bg-[var(--civic-surface-high)] text-[var(--civic-text)]" };
    if (r.targetType === "MESSAGE") return { label: "메시지", className: "bg-[var(--civic-surface-highest)] text-[var(--civic-text)]" };
    return { label: "유저", className: "bg-[var(--civic-surface-low)] text-[var(--civic-text)]" };
  }

  function urgencyFor(r: Report): { label: string; className: string } {
    if (r.status === "OPEN") return { label: "대기", className: "bg-[var(--civic-error-container)] text-[var(--civic-on-error-container)]" };
    if (r.status === "REVIEWING") return { label: "검토", className: "bg-[var(--civic-surface-high)] text-[var(--civic-text)]" };
    if (r.status === "ACTIONED") return { label: "조치", className: "bg-[var(--civic-primary)] text-[var(--civic-on-primary)]" };
    return { label: "기각", className: "bg-slate-200 text-slate-800" };
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-1 gap-1 md:grid-cols-4 lg:grid-cols-6">
        <div className="md:col-span-2 lg:col-span-2 bg-[var(--civic-primary)] p-8 flex flex-col justify-between min-h-[220px]">
          <div className="flex justify-between items-start">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--civic-on-primary)]/80">즉시 처리</div>
            <div className="rounded-sm bg-[var(--civic-error)] px-2 py-1 text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--civic-on-error)]">
              중요
            </div>
          </div>
          <div>
            <div className="text-5xl font-black text-white mb-1">{stats.open}</div>
            <div className="text-white/80 text-xs tracking-[0.2em] uppercase">대기 신고</div>
          </div>
        </div>

        <div className="md:col-span-2 lg:col-span-2 bg-[var(--civic-surface-high)] p-8 flex flex-col justify-between min-h-[220px]">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--civic-muted)]">검토 중</div>
          <div>
            <div className="text-5xl font-black text-[var(--civic-primary)] mb-1">{stats.reviewing}</div>
            <div className="text-[var(--civic-muted)] text-xs tracking-[0.2em] uppercase">검토 대기열</div>
          </div>
        </div>

        <div className="md:col-span-4 lg:col-span-2 bg-[var(--civic-surface-low)] p-8 flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--civic-muted)] mb-4">처리 속도</div>
            <div className="flex items-end gap-2 mb-4" aria-hidden>
              <div className="w-2 bg-[var(--civic-primary)] h-12" />
              <div className="w-2 bg-[var(--civic-primary)] h-16" />
              <div className="w-2 bg-[var(--civic-primary)] h-24" />
              <div className="w-2 bg-[var(--civic-primary)] h-20" />
              <div className="w-2 bg-[var(--civic-primary)] h-28" />
              <div className="w-2 bg-[var(--civic-primary)] h-32" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-2xl font-black text-[var(--civic-primary)] tracking-tighter">
              {stats.total ? Math.round((stats.actioned / stats.total) * 1000) / 10 : 0}%
            </div>
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--civic-muted)]">조치 비율</div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xl font-bold tracking-tight text-[var(--civic-primary)] uppercase" style={{ fontFamily: "var(--font-headline)" }}>
              신고 대기열
            </div>
            <div className="mt-1 text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--civic-muted)]">
              {loading ? "불러오는 중..." : `총 ${shown.length}건`}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter((v) => (v === "NEWEST" ? "OPEN_ONLY" : "NEWEST"))}
              className="bg-[var(--civic-surface-highest)] px-4 py-2 text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--civic-text)]"
            >
              필터: {filter === "NEWEST" ? "최신순" : "대기/검토"}
            </button>
            <button
              type="button"
              className="bg-[var(--civic-primary)] text-[var(--civic-on-primary)] px-4 py-2 text-[10px] font-bold tracking-[0.2em] uppercase"
              onClick={load}
            >
              새로고침
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
        ) : null}

        <div className="mt-6 space-y-1">
          {shown.map((r) => {
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
          const typeBadge = badgeFor(r);
          const urgency = urgencyFor(r);

          return (
            <div
              key={r.id}
              className="bg-[var(--civic-surface-lowest)] p-6 flex flex-col lg:flex-row items-start lg:items-center gap-6 hover:bg-[var(--civic-surface-low)] transition-colors duration-200"
            >
              <div className="flex-shrink-0 w-16 h-16 bg-[var(--civic-surface-container, var(--civic-surface-high))] flex items-center justify-center">
                <span className="text-2xl font-black text-[var(--civic-primary)]">{r.targetType[0]}</span>
              </div>

              <div className="flex-grow min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <span className={`px-2 py-0.5 text-[10px] font-bold tracking-[0.2em] uppercase ${urgency.className}`}>{urgency.label}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold tracking-[0.2em] uppercase ${typeBadge.className}`}>{typeBadge.label}</span>
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--civic-muted)]">
                    신고 ID: #{r.id.slice(0, 8)}
                  </span>
                </div>

                <div className="text-lg font-bold text-[var(--civic-primary)] mb-1">
                  {r.targetType === "ITEM"
                    ? `글 신고`
                    : r.targetType === "MESSAGE"
                      ? `메시지 신고`
                      : `유저 신고`}
                </div>

                <div className="text-sm text-[var(--civic-muted)] line-clamp-2">{r.reason}</div>

                <div className="mt-2 text-xs text-[var(--civic-muted)]">
                  {new Date(r.createdAt).toLocaleString("ko-KR")} · 신고자: {r.reporter.displayName} ({r.reporter.email})
                </div>

                <div className="mt-2 text-sm">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--civic-muted)]">대상</span>
                  <div className="mt-1">{target}</div>
                </div>
              </div>

              <div className="flex-shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  className="bg-[var(--civic-surface-highest)] text-[var(--civic-text)] px-6 py-3 text-[10px] tracking-[0.2em] uppercase font-bold hover:bg-[var(--civic-surface-high)] transition-colors"
                  disabled
                  title="조치 API 연결 예정"
                >
                  기각
                </button>
                <button
                  type="button"
                  className="bg-[var(--civic-error)] text-[var(--civic-on-error)] px-6 py-3 text-[10px] tracking-[0.2em] uppercase font-bold hover:opacity-90 transition-opacity"
                  disabled
                  title="조치 API 연결 예정"
                >
                  삭제
                </button>
                <button
                  type="button"
                  className="bg-[var(--civic-primary)] text-[var(--civic-on-primary)] px-6 py-3 text-[10px] tracking-[0.2em] uppercase font-bold hover:bg-[var(--civic-primary-container)] transition-colors"
                  disabled
                  title="조치 API 연결 예정"
                >
                  정지
                </button>
              </div>
            </div>
          );
        })}
          {shown.length === 0 ? (
            <div className="bg-[var(--civic-surface-lowest)] p-6 text-sm text-[var(--civic-muted)]">신고가 없습니다.</div>
          ) : null}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            className="text-[var(--civic-primary)] text-[11px] tracking-[0.2em] uppercase font-bold underline underline-offset-8 decoration-[var(--civic-border)]"
            onClick={load}
          >
            이전 항목 불러오기(새로고침)
          </button>
        </div>
      </section>
    </div>
  );
}

