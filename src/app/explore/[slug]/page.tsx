import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Section } from "@/components/ui/section";
import { CTAButton } from "@/components/ui/cta-button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ImageCarousel } from "@/components/ui/image-carousel";
import type { Storyworld, Theme } from "@/lib/supabase/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("ah_storyworlds").select("name, atmosphere, meta_title, meta_description").eq("slug", slug).single();
  if (!data) return { title: "Storyworld" };
  return {
    title: data.meta_title || data.name,
    description: data.meta_description || data.atmosphere || `Explore ${data.name} with Agent Henrik.`,
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
      {/* Back navigation */}
      <div className="mx-auto max-w-[1200px] px-6 pt-32 md:px-12">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Back to Storyworld Map
        </Link>
      </div>

      {/* Split Layout — matching theme detail pages */}
      <div className="mx-auto max-w-[1200px] px-6 py-12 md:px-12">
        <div className="grid gap-0 md:grid-cols-2 md:min-h-[70vh]">
          {/* Left: Image */}
          <div className="relative min-h-[400px] bg-muted md:min-h-0">
            {storyworld.images && storyworld.images.length > 0 ? (
              <ImageCarousel images={storyworld.images} alt={storyworld.name} />
            ) : storyworld.hero_image_url ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${storyworld.hero_image_url})` }}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="font-serif text-6xl font-light text-muted-foreground/30">
                  {storyworld.name}
                </span>
              </div>
            )}
          </div>

          {/* Right: Info (scrollable) */}
          <div className="flex flex-col border border-border p-8 md:max-h-[70vh] md:overflow-y-auto md:p-12">
            {storyworld.region && (
              <p className="nav-text mb-2 text-muted-foreground">{storyworld.region}</p>
            )}
            <h1 className="mb-6 font-serif text-4xl font-light md:text-5xl">
              {storyworld.name}
            </h1>

            {storyworld.atmosphere && (
              <div className="mb-8">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {storyworld.atmosphere}
                </p>
              </div>
            )}

            {/* Suggested Themes */}
            {suggestedThemes.length > 0 && (
              <div className="mb-8">
                <h3 className="nav-text mb-3 text-foreground">Suggested Themes</h3>
                <div className="space-y-2">
                  {suggestedThemes.map((theme) => (
                    <Link
                      key={theme.id}
                      href={`/experiences/${theme.slug}`}
                      className="group flex items-center justify-between border border-border p-3 transition-colors duration-400 hover:bg-muted"
                    >
                      <div>
                        <span className="font-serif text-sm font-light">{theme.title}</span>
                        {theme.tagline && (
                          <span className="ml-2 text-xs text-muted-foreground">{theme.tagline}</span>
                        )}
                      </div>
                      <ArrowRight
                        size={14}
                        className="shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-foreground"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-auto pt-8">
              <CTAButton href={`/liv?storyworld=${storyworld.slug}`}>
                Design with Agent Henrik
              </CTAButton>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom return */}
      <Section>
        <div className="text-center">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={14} />
            Return to Storyworld Map
          </Link>
        </div>
      </Section>
    </>
  );
}
