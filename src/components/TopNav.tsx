import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";

export async function TopNav() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight text-zinc-900">
          줍줍
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/items/new" className="rounded-md px-3 py-2 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900">
            새 글
          </Link>
          {user ? (
            <>
              <span className="hidden text-xs text-zinc-600 sm:inline">
                {user.displayName}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-md px-3 py-2 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900">
                로그인
              </Link>
              <Link href="/signup" className="rounded-md bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-2 font-medium text-white shadow-sm hover:opacity-95">
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

