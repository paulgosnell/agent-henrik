import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CTAButton } from "@/components/ui/cta-button";
import { ArrowRight } from "lucide-react";
import { ImageCarousel } from "@/components/ui/image-carousel";
import type { Theme, Storyworld } from "@/lib/supabase/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("ah_themes").select("title, definition, meta_title, meta_description").eq("slug", slug).single();
  if (!data) return { title: "Theme" };
  return {
    title: data.meta_title || data.title,
    description: data.meta_description || data.definition || `Explore ${data.title} journeys with Agent Henrik.`,
  };
}

export default async function ThemeDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("ah_themes").select("*").eq("slug", slug).single();

  if (!data) notFound();

  const theme = data as Theme;

  // Find storyworlds that suggest this theme
  let suggestedStoryworlds: Storyworld[] = [];
  const { data: storyworldsData } = await supabase
    .from("ah_storyworlds")
    .select("*")
    .contains("suggested_theme_ids", [theme.id])
    .eq("published", true);
  suggestedStoryworlds = (storyworldsData as Storyworld[]) || [];

  return (
    <div className="pt-36">
      {/* Split Screen Layout */}
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <div className="grid min-h-[70vh] md:grid-cols-2">
          {/* Left — Media Panel */}
          <div className="relative flex min-h-[400px] items-center justify-center bg-muted md:min-h-0">
            {theme.images && theme.images.length > 0 ? (
              <ImageCarousel images={theme.images} alt={theme.title} />
            ) : theme.image_url ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${theme.image_url})` }}
              />
            ) : (
              <span className="font-serif text-3xl font-light text-muted-foreground">
                {theme.title}
              </span>
            )}
          </div>

          {/* Right — Info Panel */}
          <div className="flex flex-col border border-border px-8 py-12 md:px-12">
            <h1 className="mb-4 font-serif text-4xl font-light md:text-5xl">
              {theme.title}
            </h1>

            {theme.tagline && (
              <p className="mb-6 text-lg italic text-muted-foreground">
                {theme.tagline}
              </p>
            )}

            {theme.definition && (
              <div className="mb-8">
                <h3 className="nav-text mb-2 text-muted-foreground">Definition</h3>
                <p className="leading-relaxed">{theme.definition}</p>
              </div>
            )}

            {theme.includes && theme.includes.length > 0 && (
              <div className="mb-8">
                <h3 className="nav-text mb-2 text-muted-foreground">Includes</h3>
                <ul className="space-y-1">
                  {theme.includes.map((item, i) => (
                    <li key={i} className="text-sm">{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {theme.activities && theme.activities.length > 0 && (
              <div className="mb-8">
                <h3 className="nav-text mb-2 text-muted-foreground">Activities</h3>
                <ul className="space-y-1">
                  {theme.activities.map((act, i) => (
                    <li key={i} className="text-sm">{act}</li>
                  ))}
                </ul>
              </div>
            )}

            {theme.purpose && (
              <div className="mb-8">
                <h3 className="nav-text mb-2 text-muted-foreground">Purpose</h3>
                <p className="text-sm leading-relaxed">{theme.purpose}</p>
              </div>
            )}

            {suggestedStoryworlds.length > 0 && (
              <div className="mb-8">
                <h3 className="nav-text mb-3 text-muted-foreground">Suggested Destinations</h3>
                <div className="space-y-2">
                  {suggestedStoryworlds.map((sw) => (
                    <Link
                      key={sw.id}
                      href={`/explore/${sw.slug}`}
                      className="group flex items-center justify-between border border-border p-3 transition-colors duration-400 hover:bg-muted"
                    >
                      <div>
                        <span className="font-serif text-sm font-light">{sw.name}</span>
                        {sw.region && (
                          <span className="ml-2 text-xs text-muted-foreground">{sw.region}</span>
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

            <div className="mt-auto pt-4">
              <CTAButton href={`/liv?theme=${theme.slug}`}>
                Design Your Journey with Agent Henrik
              </CTAButton>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
