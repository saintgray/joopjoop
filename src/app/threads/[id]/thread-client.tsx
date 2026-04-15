"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toKoreanMessage } from "@/lib/userMessages";

type Message = {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  sender: { displayName: string };
};

export function ThreadClient(props: { threadId: string; meId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => body.trim().length > 0 && body.length <= 2000, [body]);

  async function load() {
    setError(null);
    const res = await fetch(`/api/threads/${props.threadId}/messages`, { cache: "no-store" });
    const json = (await res.json()) as { ok: boolean; messages?: Message[]; error?: string };
    if (!json.ok) {
      setError(toKoreanMessage(json.error ?? "LOAD_FAILED"));
      return;
    }
    setMessages(json.messages ?? []);
  }

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 2500);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.threadId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  async function send() {
    if (!canSend || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/threads/${props.threadId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) {
        setError(toKoreanMessage(json.error ?? "SEND_FAILED"));
        return;
      }
      setBody("");
      await load();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[70vh] flex-col">
      <div ref={listRef} className="flex-1 overflow-auto p-6">
        {error ? (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        {messages.length === 0 ? (
          <div className="text-sm text-[var(--civic-muted)]">아직 메시지가 없어요. 먼저 인사해보세요.</div>
        ) : (
          <div className="space-y-2">
            {messages.map((m) => {
              const mine = m.senderId === props.meId;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={[
                      "max-w-[85%] px-4 py-3 text-sm",
                      mine
                        ? "bg-[var(--civic-primary)] text-[var(--civic-on-primary)]"
                        : "bg-[var(--civic-surface-low)] text-[var(--civic-text)] border-l-4 border-[var(--civic-primary)]",
                    ].join(" ")}
                  >
                    <div className={`text-[11px] ${mine ? "text-white/80" : "text-[var(--civic-muted)]"}`}>
                      {mine ? "나" : m.sender.displayName} ·{" "}
                      {new Date(m.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="whitespace-pre-wrap">{m.body}</div>
                    <div className="mt-2 text-[11px] opacity-80">
                      <Link className="underline" href={`/report?type=MESSAGE&id=${m.id}`}>신고</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-[var(--civic-border)] bg-[var(--civic-surface-lowest)] px-4 py-4">
        <div className="flex items-end gap-4">
          <button className="mb-2 p-2 hover:bg-[var(--civic-surface-high)] transition-colors text-slate-500" type="button" aria-label="attach">
            +
          </button>
          <div className="flex-grow relative">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-[var(--civic-surface-low)] border-b-2 border-[var(--civic-primary)] focus:ring-0 text-sm py-3 px-4 placeholder:text-slate-500 resize-none overflow-hidden"
              placeholder="메시지를 입력하세요..."
              rows={1}
            />
          </div>
          <button
            type="button"
            disabled={!canSend || loading}
            onClick={send}
            className="bg-[var(--civic-primary)] text-[var(--civic-on-primary)] px-6 py-3 font-bold uppercase tracking-widest text-[11px] disabled:opacity-60"
          >
            {loading ? "전송 중" : "전송"}
          </button>
        </div>
      </div>
    </div>
  );
}

