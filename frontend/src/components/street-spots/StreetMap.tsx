"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export interface Coords {
  lat: number;
  lng: number;
}

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const LJUBLJANA: [number, number] = [46.05, 14.51];

function ClickHandler({ onSelect }: { onSelect: (coords: Coords) => void }) {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function StreetMap({
  onLocationSelect,
}: {
  onLocationSelect: (coords: Coords) => void;
}) {
  const [marker, setMarker] = useState<Coords | null>(null);
  const [center, setCenter] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setCenter(LJUBLJANA);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
      () => setCenter(LJUBLJANA),
      { timeout: 10000 },
    );
  }, []);

  if (!center) {
    return (
      <div className="flex h-[450px] items-center justify-center text-white/40">
        Loading map...
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ width: "100%", height: "450px" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler
        onSelect={(coords) => {
          setMarker(coords);
          onLocationSelect(coords);
        }}
      />
      {marker && (
        <Marker position={[marker.lat, marker.lng]} icon={markerIcon} />
      )}
    </MapContainer>
  );
}
