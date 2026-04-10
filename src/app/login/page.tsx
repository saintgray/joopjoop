import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">로그인</h1>
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white/90 p-5 text-zinc-900 shadow-sm">
        <LoginForm />
      </div>
    </main>
  );
}

