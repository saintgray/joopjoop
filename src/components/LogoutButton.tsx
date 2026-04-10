"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      className="rounded-md px-3 py-2 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-60"
      onClick={async () => {
        setLoading(true);
        try {
          await fetch("/api/auth/logout", { method: "POST" });
          router.push("/");
          router.refresh();
        } finally {
          setLoading(false);
        }
      }}
    >
      로그아웃
    </button>
  );
}

