"use client";

import dynamic from "next/dynamic";
import type { Storyworld } from "@/lib/supabase/types";

const MiniMap = dynamic(
  () => import("@/components/map/mini-map").then((mod) => mod.MiniMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-muted text-muted-foreground text-sm">
        Loading map...
      </div>
    ),
  }
);

export function MiniMapLoader({ storyworlds }: { storyworlds: Storyworld[] }) {
  return <MiniMap storyworlds={storyworlds} />;
}
