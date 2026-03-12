"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { ArrowRight, MapPin, Filter, X } from "lucide-react";
import { MAP_CONFIG, CATEGORY_CONFIG, CATEGORY_COLORS } from "@/lib/constants";
import type { Storyworld, Theme, Storyteller } from "@/lib/supabase/types";
import "leaflet/dist/leaflet.css";

function createPinIcon(color: string) {
  return new L.DivIcon({
    html: `<div style="
      width: 12px;
      height: 12px;
      background: ${color};
      border: 2px solid ${color === "#ffffff" ? "black" : "rgba(0,0,0,0.3)"};
      border-radius: 50%;
      box-shadow: 0 0 6px rgba(0,0,0,0.3);
    "></div>`,
    className: "",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -10],
  });
}

const SEASONS = ["spring", "summer", "autumn", "winter"] as const;

function InvalidateSizeOnMount() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

interface StoryworldMapProps {
  storyworlds: Storyworld[];
  themes?: Theme[];
  storytellers?: Storyteller[];
}

export function StoryworldMap({ storyworlds, themes = [], storytellers = [] }: StoryworldMapProps) {
  const [mapTheme, setMapTheme] = useState<"dark" | "light">("dark");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeSeasons, setActiveSeasons] = useState<Set<string>>(new Set(SEASONS));
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set(CATEGORY_CONFIG.map((c) => c.slug)));
  const [activeThemes, setActiveThemes] = useState<Set<string>>(new Set(themes.map((t) => t.id)));

  // Update active themes when themes prop loads
  useEffect(() => {
    if (themes.length > 0 && activeThemes.size === 0) {
      setActiveThemes(new Set(themes.map((t) => t.id)));
    }
  }, [themes]);

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

  function toggleSet<T>(set: Set<T>, value: T): Set<T> {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  }

  function toggleAll<T>(set: Set<T>, allValues: T[]): Set<T> {
    if (set.size === allValues.length) return new Set<T>();
    return new Set(allValues);
  }

  // Filter storyworlds
  const filteredStoryworlds = useMemo(() => {
    return storyworlds.filter((sw) => {
      if (!sw.latitude || !sw.longitude) return false;
      // Season filter: passes if ANY active season is in the storyworld's seasons
      const seasonMatch = sw.seasons?.some((s) => activeSeasons.has(s)) ?? true;
      // Category filter
      const categoryMatch = activeCategories.has(sw.category || "city");
      return seasonMatch && categoryMatch;
    });
  }, [storyworlds, activeSeasons, activeCategories]);

  // Filter storytellers
  const filteredStorytellers = useMemo(() => {
    if (!activeCategories.has("storyteller")) return [];
    return storytellers.filter((st) => st.show_on_map && st.latitude && st.longitude);
  }, [storytellers, activeCategories]);

  const tileUrl = mapTheme === "dark" ? MAP_CONFIG.tileUrl.dark : MAP_CONFIG.tileUrl.light;

  return (
    <MapContainer
      center={MAP_CONFIG.center}
      zoom={MAP_CONFIG.zoom}
      minZoom={MAP_CONFIG.minZoom}
      maxZoom={MAP_CONFIG.maxZoom}
      className="h-full w-full"
      zoomControl={false}
      scrollWheelZoom={false}
      attributionControl={false}
      worldCopyJump={true}
    >
      <InvalidateSizeOnMount />
      <TileLayer url={tileUrl} attribution={MAP_CONFIG.attribution} />

      {/* Filter Panel - overlaid on map */}
      <div className="leaflet-top leaflet-left" style={{ pointerEvents: "none" }}>
        <div className="leaflet-control" style={{ pointerEvents: "auto", marginTop: "10px", marginLeft: "10px" }}>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-1.5 rounded bg-[var(--background)]/90 px-3 py-2 text-xs font-medium text-[var(--foreground)] shadow-lg backdrop-blur-sm border border-[var(--border)] cursor-pointer"
          >
            <Filter size={12} />
            Filters
            {filtersOpen && <X size={12} className="ml-1" />}
          </button>

          {filtersOpen && (
            <div className="mt-2 w-64 rounded bg-[var(--background)]/95 p-3 shadow-lg backdrop-blur-sm border border-[var(--border)] space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto">
              {/* Seasons */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Seasons</span>
                  <button
                    onClick={() => setActiveSeasons(toggleAll(activeSeasons, [...SEASONS]))}
                    className="text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                  >
                    {activeSeasons.size === SEASONS.length ? "None" : "All"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {SEASONS.map((season) => (
                    <button
                      key={season}
                      onClick={() => setActiveSeasons(toggleSet(activeSeasons, season))}
                      className={`px-2 py-1 text-[10px] rounded capitalize cursor-pointer transition-colors ${
                        activeSeasons.has(season)
                          ? "bg-[var(--foreground)] text-[var(--background)]"
                          : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                      }`}
                    >
                      {season}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Categories</span>
                  <button
                    onClick={() => setActiveCategories(toggleAll(activeCategories, CATEGORY_CONFIG.map((c) => c.slug)))}
                    className="text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                  >
                    {activeCategories.size === CATEGORY_CONFIG.length ? "None" : "All"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {CATEGORY_CONFIG.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => setActiveCategories(toggleSet(activeCategories, cat.slug))}
                      className={`flex items-center gap-1 px-2 py-1 text-[10px] rounded cursor-pointer transition-colors ${
                        activeCategories.has(cat.slug)
                          ? "bg-[var(--foreground)] text-[var(--background)]"
                          : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                      }`}
                    >
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: CATEGORY_COLORS[cat.slug] || "#fff" }}
                      />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Themes */}
              {themes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Themes</span>
                    <button
                      onClick={() => setActiveThemes(toggleAll(activeThemes, themes.map((t) => t.id)))}
                      className="text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                    >
                      {activeThemes.size === themes.length ? "None" : "All"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setActiveThemes(toggleSet(activeThemes, theme.id))}
                        className={`px-2 py-1 text-[10px] rounded cursor-pointer transition-colors ${
                          activeThemes.has(theme.id)
                            ? "bg-[var(--foreground)] text-[var(--background)]"
                            : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                        }`}
                      >
                        {theme.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Storyworld markers */}
      {filteredStoryworlds.map((sw) => (
        <Marker
          key={sw.id}
          position={[sw.latitude!, sw.longitude!]}
          icon={createPinIcon(CATEGORY_COLORS[sw.category || "city"] || "#ffffff")}
        >
          <Popup className="storyworld-popup" maxWidth={520} minWidth={460} autoPanPaddingTopLeft={L.point(50, 80)} autoPanPaddingBottomRight={L.point(50, 50)}>
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
      ))}

      {/* Storyteller markers */}
      {filteredStorytellers.map((st) => (
        <Marker
          key={`st-${st.id}`}
          position={[st.latitude!, st.longitude!]}
          icon={createPinIcon(CATEGORY_COLORS.storyteller)}
        >
          <Popup className="storyworld-popup" maxWidth={400} minWidth={300} autoPanPaddingTopLeft={L.point(50, 80)} autoPanPaddingBottomRight={L.point(50, 50)}>
            <div className="storyworld-popup-inner">
              {st.portrait_url && (
                <div
                  className="storyworld-popup-hero"
                  style={{ backgroundImage: `url(${st.portrait_url})` }}
                />
              )}
              <div className="storyworld-popup-content">
                <div className="storyworld-popup-region">
                  <MapPin size={11} />
                  <span>{st.category || "Storyteller"}</span>
                </div>
                <h4 className="storyworld-popup-title">{st.name}</h4>
                {st.role && (
                  <p className="storyworld-popup-atmosphere">{st.role}</p>
                )}
                <div className="storyworld-popup-actions">
                  <Link href={`/storytellers/${st.slug}`} className="storyworld-popup-cta">
                    Meet {st.name.split(" ")[0]} <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
