import { createClient } from "@/lib/supabase/server";
import { getPageMeta } from "@/lib/utils/page-meta";
import { MapLoader } from "@/components/map/map-loader";
import type { Storyworld, Theme, Storyteller } from "@/lib/supabase/types";

export async function generateMetadata() {
  return getPageMeta("/explore", {
    title: "Explore",
    description: "Discover Agent Henrik's Storyworlds across the globe. Ten cities, ten narratives.",
  });
}

export default async function ExplorePage() {
  const supabase = await createClient();
  const [storyworldsResult, themesResult, storytellersResult] = await Promise.all([
    supabase.from("ah_storyworlds").select("*").eq("published", true).order("display_order"),
    supabase.from("ah_themes").select("*").eq("published", true).order("display_order"),
    supabase.from("ah_storytellers").select("*").eq("published", true).eq("show_on_map", true),
  ]);

  const storyworlds = (storyworldsResult.data as Storyworld[]) || [];
  const themes = (themesResult.data as Theme[]) || [];
  const storytellers = (storytellersResult.data as Storyteller[]) || [];

  return (
    <div className="relative z-0 h-[calc(100vh-4rem)] w-full" style={{ marginTop: '4rem' }}>
      <MapLoader storyworlds={storyworlds} themes={themes} storytellers={storytellers} />
    </div>
  );
}
