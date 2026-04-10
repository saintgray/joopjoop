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
        <div className="rounded-2xl border border-white/10 bg-white p-5 text-sm text-zinc-900">권한이 없습니다.</div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">신고 관리</h1>
          <p className="mt-2 text-sm text-zinc-300">최신 신고 100건을 확인하고 조치합니다.</p>
        </div>
        <Link className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 hover:bg-white/10" href="/">
          홈
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white text-zinc-900">
        <div className="border-b px-5 py-3 text-sm font-semibold">목록</div>
        <div className="p-5">
          <ModReportsClient />
        </div>
      </div>
    </main>
  );
}

