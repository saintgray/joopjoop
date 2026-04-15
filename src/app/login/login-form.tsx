"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { toKoreanMessage } from "@/lib/userMessages";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (!res?.ok) {
        setError(toKoreanMessage(res?.error ?? "LOGIN_FAILED"));
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <label className="flex flex-col gap-2 text-sm">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--civic-muted)]">이메일</span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 border border-[var(--civic-border)] bg-[var(--civic-surface-lowest)] px-3 text-sm text-[var(--civic-text)] outline-none focus:border-[var(--civic-primary)] focus:ring-2 focus:ring-[var(--civic-primary)]/10"
          type="email"
          required
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--civic-muted)]">비밀번호</span>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 border border-[var(--civic-border)] bg-[var(--civic-surface-lowest)] px-3 text-sm text-[var(--civic-text)] outline-none focus:border-[var(--civic-primary)] focus:ring-2 focus:ring-[var(--civic-primary)]/10"
          type="password"
          required
        />
      </label>
      <button
        disabled={loading}
        className="mt-2 h-11 bg-[var(--civic-primary)] text-[var(--civic-on-primary)] text-[11px] font-bold tracking-[0.2em] uppercase disabled:opacity-60"
      >
        {loading ? "로그인 중..." : "로그인"}
      </button>
      {error ? (
        <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}
      <div className="text-sm text-[var(--civic-muted)]">
        계정이 없나요? <Link className="underline" href="/signup">회원가입</Link>
      </div>
    </form>
  );
}

