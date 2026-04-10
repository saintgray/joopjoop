"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function StartChatButton(props: { itemId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={loading}
        className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        onClick={async () => {
          setLoading(true);
          setError(null);
          try {
            const res = await fetch("/api/threads", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ itemId: props.itemId }),
            });
            const json = (await res.json()) as { ok: boolean; thread?: { id: string }; error?: string };
            if (!json.ok || !json.thread?.id) {
              setError(json.error ?? "THREAD_CREATE_FAILED");
              return;
            }
            router.push(`/threads/${json.thread.id}`);
          } finally {
            setLoading(false);
          }
        }}
      >
        {loading ? "연결 중..." : "채팅 시작"}
      </button>
      {error ? <div className="text-xs text-red-700">{error}</div> : null}
    </div>
  );
}

