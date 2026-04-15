"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { toKoreanMessage } from "@/lib/userMessages";

export function SignupForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneSent, setPhoneSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendEmail() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "send_verification_email", email }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) {
        setError(toKoreanMessage(json.error ?? "EMAIL_SEND_FAILED"));
        return;
      }
      setEmailSent(true);
    } finally {
      setLoading(false);
    }
  }

  async function verifyEmail() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "verify_email", email, code: emailCode }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) {
        setError(toKoreanMessage(json.error ?? "EMAIL_VERIFY_FAILED"));
        return;
      }
      setEmailVerified(true);
    } finally {
      setLoading(false);
    }
  }

  async function sendPhone() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "send_verification_phone", email, phone }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) {
        setError(toKoreanMessage(json.error ?? "SMS_SEND_FAILED"));
        return;
      }
      setPhoneSent(true);
    } finally {
      setLoading(false);
    }
  }

  async function verifyPhone() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "verify_phone", email, code: phoneCode }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) {
        setError(toKoreanMessage(json.error ?? "SMS_VERIFY_FAILED"));
        return;
      }
      setPhoneVerified(true);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "finalize",
          displayName,
          email,
          password,
          phone: phone.trim() ? phone : undefined,
        }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) {
        setError(toKoreanMessage(json.error ?? "SIGNUP_FAILED"));
        return;
      }

      const login = await signIn("credentials", { redirect: false, email, password });
      if (!login?.ok) {
        router.push("/login");
        router.refresh();
        return;
      }

      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const canFinalize =
    displayName.trim().length >= 2 &&
    email.includes("@") &&
    password.length >= 8 &&
    emailVerified &&
    (!phone.trim() || phoneVerified);

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <label className="flex flex-col gap-2 text-sm">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--civic-muted)]">표시 이름</span>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="h-11 border border-[var(--civic-border)] bg-[var(--civic-surface-lowest)] px-3 text-sm text-[var(--civic-text)] outline-none focus:border-[var(--civic-primary)] focus:ring-2 focus:ring-[var(--civic-primary)]/10"
          required
        />
      </label>
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

      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <button
          type="button"
          disabled={loading || !email.trim()}
          onClick={sendEmail}
          className="h-11 bg-[var(--civic-surface-highest)] text-[var(--civic-text)] text-[11px] font-bold tracking-[0.2em] uppercase disabled:opacity-60 hover:bg-[var(--civic-surface-high)] transition-colors"
        >
          {emailSent ? "이메일 재전송" : "이메일 인증코드 전송"}
        </button>
        <input
          value={emailCode}
          onChange={(e) => setEmailCode(e.target.value)}
          className="h-11 border border-[var(--civic-border)] bg-[var(--civic-surface-lowest)] px-3 text-sm text-[var(--civic-text)] outline-none focus:border-[var(--civic-primary)] focus:ring-2 focus:ring-[var(--civic-primary)]/10"
          placeholder="이메일 코드"
          inputMode="numeric"
        />
        <button
          type="button"
          disabled={loading || !emailSent || !emailCode.trim() || emailVerified}
          onClick={verifyEmail}
          className="h-11 bg-[var(--civic-primary)] text-[var(--civic-on-primary)] text-[11px] font-bold tracking-[0.2em] uppercase disabled:opacity-60 hover:bg-[var(--civic-primary-container)] transition-colors"
        >
          {emailVerified ? "이메일 인증 완료" : "이메일 인증"}
        </button>
      </div>
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

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--civic-muted)]">전화번호(선택)</span>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-11 border border-[var(--civic-border)] bg-[var(--civic-surface-lowest)] px-3 text-sm text-[var(--civic-text)] outline-none focus:border-[var(--civic-primary)] focus:ring-2 focus:ring-[var(--civic-primary)]/10"
          placeholder="예: 01012345678"
          inputMode="tel"
        />
      </label>

      {phone.trim() ? (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <button
            type="button"
            disabled={loading || !emailVerified}
            onClick={sendPhone}
            className="h-11 bg-[var(--civic-surface-highest)] text-[var(--civic-text)] text-[11px] font-bold tracking-[0.2em] uppercase disabled:opacity-60 hover:bg-[var(--civic-surface-high)] transition-colors"
          >
            {phoneSent ? "SMS 재전송" : "SMS 인증코드 전송"}
          </button>
          <input
            value={phoneCode}
            onChange={(e) => setPhoneCode(e.target.value)}
            className="h-11 border border-[var(--civic-border)] bg-[var(--civic-surface-lowest)] px-3 text-sm text-[var(--civic-text)] outline-none focus:border-[var(--civic-primary)] focus:ring-2 focus:ring-[var(--civic-primary)]/10"
            placeholder="SMS 코드"
            inputMode="numeric"
          />
          <button
            type="button"
            disabled={loading || !phoneSent || !phoneCode.trim() || phoneVerified}
            onClick={verifyPhone}
            className="h-11 bg-[var(--civic-primary)] text-[var(--civic-on-primary)] text-[11px] font-bold tracking-[0.2em] uppercase disabled:opacity-60 hover:bg-[var(--civic-primary-container)] transition-colors"
          >
            {phoneVerified ? "SMS 인증 완료" : "SMS 인증"}
          </button>
        </div>
      ) : null}
      <button
        disabled={loading || !canFinalize}
        className="mt-2 h-11 bg-[var(--civic-primary)] text-[var(--civic-on-primary)] text-[11px] font-bold tracking-[0.2em] uppercase disabled:opacity-60"
      >
        {loading ? "가입 중..." : "회원가입"}
      </button>
      {error ? (
        <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}
      <div className="text-sm text-[var(--civic-muted)]">
        이미 계정이 있나요? <Link className="underline" href="/login">로그인</Link>
      </div>
    </form>
  );
}

