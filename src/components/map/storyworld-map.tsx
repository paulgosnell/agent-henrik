"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { MAP_CONFIG } from "@/lib/constants";
import type { Storyworld } from "@/lib/supabase/types";
import "leaflet/dist/leaflet.css";

// Custom minimal pin icon
const pinIcon = new L.DivIcon({
  html: `<div style="
    width: 12px;
    height: 12px;
    background: white;
    border: 2px solid black;
    border-radius: 50%;
    box-shadow: 0 0 6px rgba(0,0,0,0.3);
  "></div>`,
  className: "",
  iconSize: [12, 12],
  iconAnchor: [6, 6],
  popupAnchor: [0, -10],
});

interface StoryworldMapProps {
  storyworlds: Storyworld[];
}

export function StoryworldMap({ storyworlds }: StoryworldMapProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "dark" | "light" | null;
    if (stored) setTheme(stored);

    const observer = new MutationObserver(() => {
      const t = document.documentElement.getAttribute("data-theme") as "dark" | "light" | null;
      if (t) setTheme(t);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const tileUrl = theme === "dark" ? MAP_CONFIG.tileUrl.dark : MAP_CONFIG.tileUrl.light;

  return (
    <MapContainer
      center={MAP_CONFIG.center}
      zoom={MAP_CONFIG.zoom}
      minZoom={MAP_CONFIG.minZoom}
      maxZoom={MAP_CONFIG.maxZoom}
      className="h-full w-full"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer url={tileUrl} attribution={MAP_CONFIG.attribution} />
      {storyworlds.map((sw) => {
        if (!sw.latitude || !sw.longitude) return null;
        return (
          <Marker
            key={sw.id}
            position={[sw.latitude, sw.longitude]}
            icon={pinIcon}
          >
            <Popup className="storyworld-popup">
              <div className="p-2 text-center">
                <h4 className="mb-1 text-sm font-medium">{sw.name}</h4>
                {sw.region && (
                  <p className="mb-2 text-xs text-gray-500">{sw.region}</p>
                )}
                <Link
                  href={`/explore/${sw.slug}`}
                  className="text-xs underline"
                >
                  Explore Storyworld
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
