import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MapLoader } from "@/components/map/map-loader";
import type { Storyworld } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Explore",
  description: "Discover Agent Henrik's Storyworlds across the globe. Ten cities, ten narratives.",
};

export default async function ExplorePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ah_storyworlds")
    .select("*")
    .eq("published", true)
    .order("display_order");

  const storyworlds = (data as Storyworld[]) || [];

  return (
    <div className="relative z-0 h-[calc(100vh-4rem)] w-full" style={{ marginTop: '4rem' }}>
      <MapLoader storyworlds={storyworlds} />
    </div>
  );
}
