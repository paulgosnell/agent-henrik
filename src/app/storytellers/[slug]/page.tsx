import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Section } from "@/components/ui/section";
import { CTAButton } from "@/components/ui/cta-button";
import type { Storyteller } from "@/lib/supabase/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("ah_storytellers").select("name, role").eq("slug", slug).single();
  if (!data) return { title: "Storyteller" };
  return {
    title: data.name,
    description: `${data.name} — ${data.role || "Cultural Storyteller"} for Agent Henrik.`,
  };
}

export default async function StorytellerDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("ah_storytellers").select("*").eq("slug", slug).single();

  if (!data) notFound();

  const storyteller = data as Storyteller;

  return (
    <div className="pt-20">
      <div className="grid min-h-[60vh] md:grid-cols-2">
        {/* Portrait */}
        <div className="relative bg-muted">
          {storyteller.portrait_url ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${storyteller.portrait_url})` }}
            />
          ) : (
            <div className="flex h-full min-h-[400px] items-center justify-center">
              <span className="font-serif text-6xl font-light text-muted-foreground">
                {storyteller.name[0]}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center px-8 py-16 md:px-16">
          <h1 className="mb-2 font-serif text-4xl font-light md:text-5xl">
            {storyteller.name}
          </h1>
          {storyteller.role && (
            <p className="mb-6 nav-text text-muted-foreground">{storyteller.role}</p>
          )}
          {storyteller.bio && (
            <p className="mb-8 leading-relaxed text-muted-foreground">
              {storyteller.bio}
            </p>
          )}

          {storyteller.signature_experiences && storyteller.signature_experiences.length > 0 && (
            <div className="mb-8">
              <h3 className="nav-text mb-3 text-muted-foreground">
                Signature Experiences
              </h3>
              <ul className="space-y-2">
                {storyteller.signature_experiences.map((exp, i) => (
                  <li key={i} className="text-sm">{exp}</li>
                ))}
              </ul>
            </div>
          )}

          <CTAButton href={`/liv?storyteller=${storyteller.slug}`}>
            Design with Agent Henrik
          </CTAButton>
        </div>
      </div>
    </div>
  );
}
