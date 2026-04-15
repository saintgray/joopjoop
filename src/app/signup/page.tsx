import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-tighter text-[var(--civic-text)]" style={{ fontFamily: "var(--font-headline)" }}>
          회원가입
        </h1>
        <p className="mt-2 text-sm text-[var(--civic-muted)]">분실/습득 기록을 남기고, 채팅으로 확인할 수 있어요.</p>
      </div>

      <div className="mx-auto mt-8 bg-[var(--civic-surface-lowest)] p-6">
        <div className="border border-[var(--civic-border)] bg-[var(--civic-surface-lowest)] p-6">
          <SignupForm />
        </div>
      </div>
    </main>
  );
}

