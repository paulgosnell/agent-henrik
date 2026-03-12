"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { useRouter } from "next/navigation";
import { MAP_CONFIG, CATEGORY_COLORS } from "@/lib/constants";
import type { Storyworld } from "@/lib/supabase/types";
import "leaflet/dist/leaflet.css";

function createPinIcon(color: string) {
  return new L.DivIcon({
    html: `<div style="
      width: 10px;
      height: 10px;
      background: ${color};
      border: 2px solid rgba(255,255,255,0.4);
      border-radius: 50%;
      box-shadow: 0 0 6px rgba(0,0,0,0.3);
    "></div>`,
    className: "",
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });
}

function InvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

interface MiniMapProps {
  storyworlds: Storyworld[];
}

export function MiniMap({ storyworlds }: MiniMapProps) {
  const router = useRouter();
  const [mapTheme, setMapTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "dark" | "light" | null;
    if (stored) setMapTheme(stored);

    const observer = new MutationObserver(() => {
      const t = document.documentElement.getAttribute("data-theme") as "dark" | "light" | null;
      if (t) setMapTheme(t);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const tileUrl = mapTheme === "dark" ? MAP_CONFIG.tileUrl.dark : MAP_CONFIG.tileUrl.light;

  return (
    <div
      className="h-full w-full cursor-pointer"
      onClick={() => router.push("/explore")}
    >
      <MapContainer
        center={MAP_CONFIG.center}
        zoom={2}
        minZoom={2}
        maxZoom={2}
        className="h-full w-full"
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        touchZoom={false}
        attributionControl={false}
        worldCopyJump={true}
        keyboard={false}
      >
        <InvalidateSize />
        <TileLayer url={tileUrl} attribution={MAP_CONFIG.attribution} />
        {storyworlds
          .filter((sw) => sw.latitude && sw.longitude)
          .map((sw) => (
            <Marker
              key={sw.id}
              position={[sw.latitude!, sw.longitude!]}
              icon={createPinIcon(CATEGORY_COLORS[sw.category || "city"] || "#ffffff")}
              interactive={false}
            />
          ))}
      </MapContainer>
    </div>
  );
}
