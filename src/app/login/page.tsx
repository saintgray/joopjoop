import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-tighter text-[var(--civic-text)]" style={{ fontFamily: "var(--font-headline)" }}>
          로그인
        </h1>
        <p className="mt-2 text-sm text-[var(--civic-muted)]">서비스 이용을 위해 로그인이 필요합니다.</p>
      </div>

      <div className="mx-auto mt-8 bg-[var(--civic-surface-lowest)] p-6">
        <div className="border border-[var(--civic-border)] bg-[var(--civic-surface-lowest)] p-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}

