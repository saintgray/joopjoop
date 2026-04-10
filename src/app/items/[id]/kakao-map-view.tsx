"use client";

import { Map, MapMarker } from "react-kakao-maps-sdk";

export function KakaoMapView(props: { lat: number; lng: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <Map
        id="jubhaeng-item-map"
        center={{ lat: props.lat, lng: props.lng }}
        style={{ width: "100%", height: "260px" }}
        level={3}
      >
        <MapMarker position={{ lat: props.lat, lng: props.lng }} />
      </Map>
    </div>
  );
}

