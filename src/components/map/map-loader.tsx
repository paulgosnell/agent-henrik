"use client";

import dynamic from "next/dynamic";
import type { Storyworld } from "@/lib/supabase/types";

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

export function MapLoader({ storyworlds }: { storyworlds: Storyworld[] }) {
  return <StoryworldMap storyworlds={storyworlds} />;
}
