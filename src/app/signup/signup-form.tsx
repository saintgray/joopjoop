"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignupForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName, email, password }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) {
        setError(json.error ?? "SIGNUP_FAILED");
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
        <span className="text-xs font-medium text-zinc-700">표시 이름</span>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="h-10 rounded-md border px-3"
          required
        />
      </label>
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
        {loading ? "가입 중..." : "회원가입"}
      </button>
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      <div className="text-sm text-zinc-600">
        이미 계정이 있나요? <Link className="underline" href="/login">로그인</Link>
      </div>
    </form>
  );
}

