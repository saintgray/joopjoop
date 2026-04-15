import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ModReportsClient } from "./reportsClient";

export default async function ModReportsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN" && user.role !== "MOD") {
    return (
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <div className="rounded-lg border border-[var(--civic-border)] bg-white p-5 text-sm text-[var(--civic-text)]">권한이 없습니다.</div>
      </main>
    );
  }

  return (
    <div className="bg-[var(--civic-bg)] text-[var(--civic-text)] min-h-screen">
      {/* Stitch export mock: JoopJoop Moderation Hub */}
      <header className="bg-[var(--civic-bg)] sticky top-0 z-50 flex items-center justify-between px-6 py-4 opacity-90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="text-[var(--civic-primary-container)] font-black tracking-tighter uppercase text-2xl" style={{ fontFamily: "var(--font-headline)" }}>
            JoopJoop
          </div>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-8 md:flex">
            <span className="cursor-pointer text-[var(--civic-primary-container)] font-bold text-sm tracking-tight">대시보드</span>
            <span className="cursor-pointer text-[var(--civic-text)]/60 font-bold text-sm tracking-tight hover:bg-[var(--civic-surface-high)] transition-colors p-2">
              대기열
            </span>
            <span className="cursor-pointer text-[var(--civic-text)]/60 font-bold text-sm tracking-tight hover:bg-[var(--civic-surface-high)] transition-colors p-2">
              사용자
            </span>
          </nav>
          <Link className="text-sm font-bold text-[var(--civic-primary-container)]" href="/">
            홈
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Hero */}
        <section className="mb-12">
          <div className="mb-8">
            <h1 className="text-4xl font-black tracking-tighter text-[var(--civic-primary)] uppercase" style={{ fontFamily: "var(--font-headline)" }}>
              관리자 허브
            </h1>
            <p className="text-[var(--civic-muted)] text-sm tracking-widest uppercase">신고 모니터링 // 활성 세션</p>
          </div>

          {/* 데이터 연동 통계/큐 */}
          <ModReportsClient />
        </section>
      </main>

      {/* Background polish */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-50">
        <div className="absolute top-0 right-0 h-[600px] w-[600px] bg-gradient-to-bl from-[var(--civic-surface-high)]/30 to-transparent blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] bg-gradient-to-tr from-[#d6e3ff]/20 to-transparent blur-[100px]" />
      </div>
    </div>
  );
}

