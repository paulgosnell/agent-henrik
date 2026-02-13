import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { BentoGrid } from "@/components/experiences/bento-grid";
import { Section } from "@/components/ui/section";
import type { Theme } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Experiences",
  description: "Ten curated experience themes. Culture, nightlife, adventure, culinary, and more.",
};

export default async function ExperiencesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ah_themes")
    .select("*")
    .eq("published", true)
    .order("display_order");

  const themes = (data as Theme[]) || [];

  return (
    <div className="pt-20">
      <Section>
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-serif text-5xl font-light md:text-6xl">
            Experience Themes
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Ten lenses through which to see the world. Each journey is shaped by
            theme, destination, and your story.
          </p>
        </div>
        {themes.length > 0 ? (
          <BentoGrid themes={themes} />
        ) : (
          <div className="py-16 text-center text-muted-foreground">
            <p>Experience themes coming soon.</p>
          </div>
        )}
      </Section>
    </div>
  );
}
