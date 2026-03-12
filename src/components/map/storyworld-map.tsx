"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
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

type SelectedItem =
  | { type: "storyworld"; data: Storyworld }
  | { type: "storyteller"; data: Storyteller };

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
  const [selected, setSelected] = useState<SelectedItem | null>(null);

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

  const filteredStoryworlds = useMemo(() => {
    return storyworlds.filter((sw) => {
      if (!sw.latitude || !sw.longitude) return false;
      const seasonMatch = sw.seasons?.some((s) => activeSeasons.has(s)) ?? true;
      const categoryMatch = activeCategories.has(sw.category || "city");
      return seasonMatch && categoryMatch;
    });
  }, [storyworlds, activeSeasons, activeCategories]);

  const filteredStorytellers = useMemo(() => {
    if (!activeCategories.has("storyteller")) return [];
    return storytellers.filter((st) => st.show_on_map && st.latitude && st.longitude);
  }, [storytellers, activeCategories]);

  const tileUrl = mapTheme === "dark" ? MAP_CONFIG.tileUrl.dark : MAP_CONFIG.tileUrl.light;

  return (
    <div className="relative h-full w-full">
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

        {/* Filter Panel */}
        <div className="leaflet-top leaflet-left" style={{ pointerEvents: "none" }}>
          <div className="leaflet-control" style={{ pointerEvents: "auto", marginTop: "70px", marginLeft: "10px" }}>
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
            eventHandlers={{ click: () => setSelected({ type: "storyworld", data: sw }) }}
          />
        ))}

        {/* Storyteller markers */}
        {filteredStorytellers.map((st) => (
          <Marker
            key={`st-${st.id}`}
            position={[st.latitude!, st.longitude!]}
            icon={createPinIcon(CATEGORY_COLORS.storyteller)}
            eventHandlers={{ click: () => setSelected({ type: "storyteller", data: st }) }}
          />
        ))}
      </MapContainer>

      {/* Side Drawer */}
      {selected && (
        <div className="map-overlay-card">
          <button
            onClick={() => setSelected(null)}
            className="map-card-close"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          {/* Hero image */}
          {selected.type === "storyworld" && selected.data.hero_image_url && (
            <div
              className="map-card-image"
              style={{ backgroundImage: `url(${selected.data.hero_image_url})` }}
            />
          )}
          {selected.type === "storyteller" && selected.data.portrait_url && (
            <div
              className="map-card-image"
              style={{ backgroundImage: `url(${selected.data.portrait_url})` }}
            />
          )}

          {/* Content */}
          <div className="map-card-content">
            {selected.type === "storyworld" ? (
              <>
                <div className="map-card-region">
                  <MapPin size={11} />
                  <span>{selected.data.region || "Destination"}</span>
                </div>
                <h3 className="map-card-title">{selected.data.name}</h3>
                {selected.data.atmosphere && (
                  <p className="map-card-description">{selected.data.atmosphere}</p>
                )}
                {selected.data.immersion_zones && selected.data.immersion_zones.length > 0 && (
                  <div className="map-card-tags">
                    {selected.data.immersion_zones.slice(0, 4).map((zone, i) => (
                      <span key={i} className="map-card-tag">{zone}</span>
                    ))}
                  </div>
                )}
                {selected.data.seasons && selected.data.seasons.length > 0 && (
                  <div className="map-card-tags">
                    {selected.data.seasons.map((s, i) => (
                      <span key={i} className="map-card-season">{s}</span>
                    ))}
                  </div>
                )}
                <div className="map-card-actions">
                  <Link href={`/explore/${selected.data.slug}`} className="map-card-cta">
                    Explore <ArrowRight size={12} />
                  </Link>
                  <Link href={`/liv?storyworld=${selected.data.slug}`} className="map-card-cta-secondary">
                    Design with AH
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="map-card-region">
                  <MapPin size={11} />
                  <span>{selected.data.category || "Storyteller"}</span>
                </div>
                <h3 className="map-card-title">{selected.data.name}</h3>
                {selected.data.role && (
                  <p className="map-card-description">{selected.data.role}</p>
                )}
                {selected.data.bio && (
                  <p className="map-card-description text-xs">{selected.data.bio}</p>
                )}
                <div className="map-card-actions">
                  <Link href={`/storytellers/${selected.data.slug}`} className="map-card-cta">
                    Meet {selected.data.name.split(" ")[0]} <ArrowRight size={12} />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
