"use client";

import { useEffect, useMemo, useState } from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";

type Coord = { lat: number; lng: number };

export function MapModal(props: {
  initialCenter?: Coord;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: { lat: number; lng: number; addressText?: string }) => void;
}) {
  const defaultCenter = useMemo<Coord>(
    () => props.initialCenter ?? { lat: 37.5665, lng: 126.978 }, // Seoul City Hall
    [props.initialCenter],
  );

  const [pos, setPos] = useState<Coord>(defaultCenter);
  const [addressText, setAddressText] = useState<string>("");
  const [loadingAddr, setLoadingAddr] = useState(false);

  useEffect(() => {
    if (props.isOpen) {
      setPos(defaultCenter);
      setAddressText("");
    }
  }, [props.isOpen, defaultCenter]);

  async function reverseGeocode(lat: number, lng: number) {
    setLoadingAddr(true);
    try {
      const res = await fetch(`/api/kakao/coord2address?x=${encodeURIComponent(String(lng))}&y=${encodeURIComponent(String(lat))}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as { ok: boolean; address?: string | null };
      if (json.ok && json.address) setAddressText(json.address);
    } finally {
      setLoadingAddr(false);
    }
  }

  if (!props.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--civic-scrim)] p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden border border-[var(--civic-border)] bg-[var(--civic-surface-lowest)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--civic-border)] bg-[var(--civic-surface-high)] px-4 py-3">
          <div className="text-sm font-bold tracking-tight text-[var(--civic-text)]">지도에서 위치 선택</div>
          <button
            type="button"
            onClick={props.onClose}
            className="px-3 py-2 text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--civic-text)] hover:bg-[var(--civic-surface-highest)] transition-colors"
          >
            닫기
          </button>
        </div>

        <div className="p-4">
          <div className="overflow-hidden border border-[var(--civic-border)]">
            <Map
              id="jubhaeng-map"
              center={pos}
              style={{ width: "100%", height: "420px" }}
              level={3}
              onClick={(_t, mouseEvent) => {
                const latlng = mouseEvent.latLng;
                const next = { lat: latlng.getLat(), lng: latlng.getLng() };
                setPos(next);
                void reverseGeocode(next.lat, next.lng);
              }}
            >
              <MapMarker
                position={pos}
                draggable
                onDragEnd={(marker) => {
                  const latlng = marker.getPosition();
                  const next = { lat: latlng.getLat(), lng: latlng.getLng() };
                  setPos(next);
                  void reverseGeocode(next.lat, next.lng);
                }}
              />
            </Map>
          </div>

          <div className="mt-3 border border-[var(--civic-border)] bg-[var(--civic-surface-lowest)] px-4 py-3 text-sm text-[var(--civic-muted)]">
            {loadingAddr ? "주소 확인 중..." : addressText || "지도에서 위치를 클릭하거나 핀을 드래그해 선택하세요."}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={props.onClose}
              className="h-11 border border-[var(--civic-border)] bg-[var(--civic-surface-lowest)] px-5 text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--civic-text)] hover:bg-[var(--civic-surface-low)] transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => props.onConfirm({ lat: pos.lat, lng: pos.lng, addressText: addressText || undefined })}
              className="h-11 bg-[var(--civic-primary)] px-5 text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--civic-on-primary)] hover:bg-[var(--civic-primary-container)] transition-colors"
            >
              이 위치로 확정
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

