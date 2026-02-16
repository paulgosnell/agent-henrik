import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Section } from "@/components/ui/section";
import { CTAButton } from "@/components/ui/cta-button";
import { StoryArc } from "@/components/ui/story-arc";
import type { Theme } from "@/lib/supabase/types";

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

  return (
    <div className="pt-20">
      {/* Split Screen Layout */}
      <div className="grid min-h-[70vh] md:grid-cols-2">
        {/* Left — Media Panel */}
        <div className="relative flex items-center justify-center bg-muted">
          {theme.image_url ? (
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
        <div className="flex flex-col justify-center px-8 py-16 md:px-16">
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

          <CTAButton href={`/liv?theme=${theme.slug}`}>
            Design Your Journey with Agent Henrik
          </CTAButton>
        </div>
      </div>

      {/* Story Arc Section */}
      <Section className="bg-muted">
        <h2 className="mb-8 text-center font-serif text-3xl font-light md:text-4xl">
          How This Journey Unfolds
        </h2>
        <StoryArc
          arrival={theme.arrival_elements}
          immersion={theme.immersion_elements}
          climax={theme.climax_elements}
          reflection={theme.reflection_elements}
        />
      </Section>
    </div>
  );
}
