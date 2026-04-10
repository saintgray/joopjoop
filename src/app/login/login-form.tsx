"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) {
        setError(json.error ?? "LOGIN_FAILED");
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={onSubmit}>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium text-zinc-700">이메일</span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 rounded-md border px-3"
          type="email"
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium text-zinc-700">비밀번호</span>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-10 rounded-md border px-3"
          type="password"
          required
        />
      </label>
      <button
        disabled={loading}
        className="mt-2 h-11 rounded-md bg-zinc-900 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "로그인 중..." : "로그인"}
      </button>
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      <div className="text-sm text-zinc-600">
        계정이 없나요? <Link className="underline" href="/signup">회원가입</Link>
      </div>
    </form>
  );
}

