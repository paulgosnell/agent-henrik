"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
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
            <Popup className="storyworld-popup" maxWidth={340} minWidth={280}>
              <div className="storyworld-popup-inner">
                {sw.hero_image_url && (
                  <div
                    className="storyworld-popup-hero"
                    style={{ backgroundImage: `url(${sw.hero_image_url})` }}
                  />
                )}
                <div className="storyworld-popup-content">
                  <div className="storyworld-popup-region">
                    <MapPin size={11} />
                    <span>{sw.region || "Destination"}</span>
                  </div>
                  <h4 className="storyworld-popup-title">{sw.name}</h4>
                  {sw.atmosphere && (
                    <p className="storyworld-popup-atmosphere">{sw.atmosphere}</p>
                  )}
                  {sw.immersion_zones && sw.immersion_zones.length > 0 && (
                    <div className="storyworld-popup-zones">
                      {sw.immersion_zones.slice(0, 3).map((zone, i) => (
                        <span key={i} className="storyworld-popup-tag">{zone}</span>
                      ))}
                    </div>
                  )}
                  <div className="storyworld-popup-actions">
                    <Link href={`/explore/${sw.slug}`} className="storyworld-popup-cta">
                      Explore <ArrowRight size={12} />
                    </Link>
                    <Link href={`/liv?storyworld=${sw.slug}`} className="storyworld-popup-cta-secondary">
                      Design with AH
                    </Link>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
