"use client";

import { useKakaoLoader } from "react-kakao-maps-sdk";

export function KakaoMapLoader() {
  // IMPORTANT: Call loader only once app-wide.
  useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || "",
    libraries: ["services"],
  });
  return null;
}

