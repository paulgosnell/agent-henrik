"use client";

import dynamic from "next/dynamic";
import type { Storyworld, Theme, Storyteller } from "@/lib/supabase/types";

const StoryworldMap = dynamic(
  () => import("@/components/map/storyworld-map").then((mod) => mod.StoryworldMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading map...
      </div>
    ),
  }
);

interface MapLoaderProps {
  storyworlds: Storyworld[];
  themes?: Theme[];
  storytellers?: Storyteller[];
}

export function MapLoader({ storyworlds, themes, storytellers }: MapLoaderProps) {
  return <StoryworldMap storyworlds={storyworlds} themes={themes} storytellers={storytellers} />;
}
