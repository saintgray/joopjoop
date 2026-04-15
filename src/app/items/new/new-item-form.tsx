"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapModal } from "@/components/MapModal";
import { toKoreanMessage } from "@/lib/userMessages";

type CreateResult =
  | { ok: true; item: { id: string }; matches: Array<{ id: string; title: string; imagePath: string; hamming: number; distanceMeters: number }> }
  | { ok: false; error: string; message?: string };

function asRecord(v: unknown): Record<string, unknown> | null {
  return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : null;
}

export function NewItemForm() {
  const [type, setType] = useState<"LOST" | "FOUND">("LOST");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [locationText, setLocationText] = useState("");
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CreateResult | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const base = title.trim().length >= 2 && description.trim().length >= 2 && lat && lng;
    if (!base) return false;
    // 정책: FOUND는 사진 필수, LOST는 선택
    return type === "FOUND" ? !!image : true;
  }, [type, image, title, description, lat, lng]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lat || !lng) {
      setMapError("지도에서 위치를 선택해주세요.");
      return;
    }
    if (!canSubmit) return;
    if (type === "FOUND" && !image) return;

    setSubmitting(true);
    setResult(null);
    try {
      const fd = new FormData();
      if (image) fd.set("image", image);
      fd.set(
        "meta",
        JSON.stringify({
          type,
          title,
          description,
          category: category.trim() ? category.trim() : undefined,
          occurredAt: new Date(occurredAt).toISOString(),
          latitude: lat,
          longitude: lng,
          locationText: locationText.trim() ? locationText.trim() : undefined,
        }),
      );

      const res = await fetch("/api/items", { method: "POST", body: fd });
      const text = await res.text();
      let json: unknown = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = null;
      }

      if (!res.ok) {
        const obj = asRecord(json);
        const err: CreateResult = {
          ok: false,
          error: (typeof obj?.error === "string" ? obj.error : null) ?? `HTTP_${res.status}`,
          message: typeof obj?.message === "string" ? obj.message : undefined,
        };
        setResult(err);
        return;
      }

      setResult(json as CreateResult);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--civic-muted)]">유형</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "LOST" | "FOUND")}
            className="h-11 border border-[var(--civic-border)] bg-[var(--civic-surface-lowest)] px-3 text-sm outline-none focus:border-[var(--civic-primary)] focus:ring-2 focus:ring-[var(--civic-primary)]/10"
          >
            <option value="LOST">분실</option>
            <option value="FOUND">습득</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--civic-muted)]">카테고리(직접 입력)</span>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 border border-[var(--civic-border)] bg-[var(--civic-surface-lowest)] px-3 text-sm outline-none focus:border-[var(--civic-primary)] focus:ring-2 focus:ring-[var(--civic-primary)]/10"
            placeholder="예: 지갑, 열쇠, 카드"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--civic-muted)]">제목</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-11 border border-[var(--civic-border)] bg-[var(--civic-surface-lowest)] px-3 text-sm outline-none focus:border-[var(--civic-primary)] focus:ring-2 focus:ring-[var(--civic-primary)]/10"
          placeholder="예: 검정 카드지갑 분실했어요"
          required
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--civic-muted)]">설명</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-32 border border-[var(--civic-border)] bg-[var(--civic-surface-lowest)] px-3 py-3 text-sm outline-none focus:border-[var(--civic-primary)] focus:ring-2 focus:ring-[var(--civic-primary)]/10"
          placeholder="특징/내용물/습득(분실) 추정 경로 등을 적어주세요."
          required
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--civic-muted)]">시간</span>
          <input
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            type="datetime-local"
            className="h-11 border border-[var(--civic-border)] bg-[var(--civic-surface-lowest)] px-3 text-sm outline-none focus:border-[var(--civic-primary)] focus:ring-2 focus:ring-[var(--civic-primary)]/10"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--civic-muted)]">장소(텍스트)</span>
          <input
            value={locationText}
            onChange={(e) => setLocationText(e.target.value)}
            className="h-11 border border-[var(--civic-border)] bg-[var(--civic-surface-lowest)] px-3 text-sm outline-none focus:border-[var(--civic-primary)] focus:ring-2 focus:ring-[var(--civic-primary)]/10"
            placeholder="예: 홍대입구역 2번 출구"
          />
        </label>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            setMapError(null);
            setMapOpen(true);
          }}
          className="border border-[var(--civic-border)] bg-[var(--civic-surface-lowest)] px-4 py-3 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[var(--civic-surface-low)]"
        >
          지도에서 위치 선택
        </button>
        <div className="text-right text-xs text-[var(--civic-muted)]">
          {lat && lng ? "위치 선택 완료" : mapError ? <span className="text-red-700">{mapError}</span> : "핀으로 위치를 확정하세요."}
        </div>
      </div>

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--civic-muted)]">
          사진{type === "FOUND" ? "(필수)" : "(선택)"}
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          className="block w-full text-sm"
          required={type === "FOUND"}
        />
      </label>

      <button
        disabled={!canSubmit || submitting}
        className="h-11 bg-[var(--civic-primary)] text-[var(--civic-on-primary)] text-[11px] font-bold tracking-[0.2em] uppercase disabled:opacity-60"
      >
        {submitting ? "등록 중..." : "등록하고 매칭 보기"}
      </button>

      {result && !result.ok ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {toKoreanMessage(result.error, result.message)}
          {result.error === "UNAUTHORIZED" ? (
            <div className="mt-1">
              먼저 <Link className="underline" href="/login">로그인</Link> 해주세요.
            </div>
          ) : result.error === "UNSUPPORTED_IMAGE_FORMAT" ? (
            <div className="mt-1 text-xs text-red-700">
              iPhone 사진(HEIC)이면 “사진 {`>`} 공유 {`>`} 파일에 저장” 후 JPG로 변환해서 업로드하거나, 스크린샷/JPG/PNG로 다시 올려주세요.
            </div>
          ) : null}
        </div>
      ) : null}

      {result && result.ok ? (
        <div className="rounded-md border bg-zinc-50 p-3 text-sm">
          <div className="font-medium">등록 완료</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link className="rounded-md border bg-white px-3 py-2 hover:bg-zinc-50" href={`/items/${result.item.id}`}>
              글 보기
            </Link>
            <Link className="rounded-md border bg-white px-3 py-2 hover:bg-zinc-50" href="/">
              목록으로
            </Link>
          </div>

          <div className="mt-4 font-medium">추천 매칭</div>
          {result.matches.length === 0 ? (
            <div className="mt-1 text-zinc-600">추천이 없어요.</div>
          ) : (
            <ul className="mt-2 space-y-2">
              {result.matches.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 rounded-md border bg-white px-3 py-2">
                  <Link className="line-clamp-1 underline" href={`/items/${m.id}`}>
                    {m.title}
                  </Link>
                  <div className="shrink-0 text-xs text-zinc-600">
                    비슷한 정도 {m.hamming} · {Math.round(m.distanceMeters)}m
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <MapModal
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        onConfirm={(payload) => {
          setLat(String(payload.lat));
          setLng(String(payload.lng));
          if (payload.addressText && !locationText.trim()) setLocationText(payload.addressText);
          setMapOpen(false);
        }}
      />
    </form>
  );
}

