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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3">
          <div className="text-sm font-semibold text-zinc-900">지도에서 위치 선택</div>
          <button
            type="button"
            onClick={props.onClose}
            className="rounded-md px-2 py-1 text-sm text-zinc-700 hover:bg-white/60"
          >
            닫기
          </button>
        </div>

        <div className="p-4">
          <div className="overflow-hidden rounded-xl border border-gray-200">
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

          <div className="mt-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-zinc-700">
            {loadingAddr ? "주소 확인 중..." : addressText || "지도에서 위치를 클릭하거나 핀을 드래그해 선택하세요."}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={props.onClose}
              className="h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => props.onConfirm({ lat: pos.lat, lng: pos.lng, addressText: addressText || undefined })}
              className="h-10 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 text-sm font-semibold text-white shadow-sm hover:opacity-95"
            >
              이 위치로 확정
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

