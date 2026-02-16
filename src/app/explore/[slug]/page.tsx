import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Section } from "@/components/ui/section";
import { CTAButton } from "@/components/ui/cta-button";
import { StoryArc } from "@/components/ui/story-arc";
import { ArrowRight } from "lucide-react";
import type { Storyworld, Theme } from "@/lib/supabase/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("ah_storyworlds").select("name, atmosphere").eq("slug", slug).single();
  if (!data) return { title: "Storyworld" };
  return {
    title: data.name,
    description: data.atmosphere || `Explore ${data.name} with Agent Henrik.`,
  };
}

export default async function StoryworldPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("ah_storyworlds").select("*").eq("slug", slug).single();

  if (!data) notFound();

  const storyworld = data as Storyworld;

  // Fetch suggested themes if available
  let suggestedThemes: Theme[] = [];
  if (storyworld.suggested_theme_ids && storyworld.suggested_theme_ids.length > 0) {
    const { data: themesData } = await supabase
      .from("ah_themes")
      .select("*")
      .in("id", storyworld.suggested_theme_ids)
      .eq("published", true);
    suggestedThemes = (themesData as Theme[]) || [];
  }

  return (
    <>
      {/* Hero */}
      <section className="relative flex h-[70vh] items-end">
        {storyworld.hero_image_url && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${storyworld.hero_image_url})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-6 pb-16 md:px-12">
          {storyworld.region && (
            <p className="nav-text mb-2 text-white/60">{storyworld.region}</p>
          )}
          <h1 className="font-serif text-5xl font-light text-white md:text-7xl">
            {storyworld.name}
          </h1>
        </div>
      </section>

      {/* Atmosphere */}
      {storyworld.atmosphere && (
        <Section>
          <p className="mx-auto max-w-2xl text-center text-lg leading-relaxed text-muted-foreground">
            {storyworld.atmosphere}
          </p>
        </Section>
      )}

      {/* Story Arc */}
      <Section className="bg-muted">
        <h2 className="mb-8 text-center font-serif text-3xl font-light md:text-4xl">
          How This Journey Unfolds
        </h2>
        <StoryArc
          arrival={storyworld.arrival_mood ? [storyworld.arrival_mood] : null}
          immersion={storyworld.immersion_zones}
          climax={storyworld.climax_moments}
          reflection={storyworld.reflection_moments}
        />
      </Section>

      {/* Suggested Themes */}
      {suggestedThemes.length > 0 && (
        <Section>
          <h2 className="mb-8 text-center font-serif text-3xl font-light md:text-4xl">
            Suggested Themes
          </h2>
          <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
            {suggestedThemes.map((theme) => (
              <Link
                key={theme.id}
                href={`/experiences/${theme.slug}`}
                className="group flex items-center justify-between border border-border p-5 transition-colors duration-400 hover:bg-muted"
              >
                <div>
                  <h3 className="font-serif text-lg font-light">{theme.title}</h3>
                  {theme.tagline && (
                    <p className="mt-1 text-sm text-muted-foreground">{theme.tagline}</p>
                  )}
                </div>
                <ArrowRight
                  size={16}
                  className="shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-foreground"
                />
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* CTA */}
      <Section>
        <div className="text-center">
          <h2 className="mb-4 font-serif text-3xl font-light md:text-4xl">
            Create My Journey
          </h2>
          <p className="mx-auto mb-8 max-w-md text-muted-foreground">
            Let Agent Henrik craft your bespoke {storyworld.name} experience.
          </p>
          <CTAButton href={`/liv?storyworld=${storyworld.slug}`}>
            Design with Agent Henrik
          </CTAButton>
        </div>
      </Section>
    </>
  );
}
