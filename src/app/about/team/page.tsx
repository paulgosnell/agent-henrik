import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPageMeta } from "@/lib/utils/page-meta";
import { getPageContent } from "@/lib/utils/page-content";
import { Section } from "@/components/ui/section";
import { CTAButton } from "@/components/ui/cta-button";
import { PageContent } from "@/components/ui/page-content";
import type { Storyteller } from "@/lib/supabase/types";

export async function generateMetadata() {
  return getPageMeta("/about/team", {
    title: "Our Team",
    description:
      "Meet Henrik Tidefjard and the global network of cultural curators behind Agent Henrik.",
  });
}

export default async function TeamPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ah_storytellers")
    .select("*")
    .eq("published", true)
    .limit(6);

  const storytellers = (data as Storyteller[]) || [];
  const page = await getPageContent("/about/team");

  return (
    <div className="pt-20">
      {/* Founder */}
      <Section>
        <div className="flex flex-col items-center gap-12 md:flex-row md:gap-16">
          <div className="relative aspect-[3/4] w-full max-w-sm overflow-hidden">
            <div
              className="h-full w-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${page?.image_url || "https://fjnfsabvuiyzuzfhxzcc.supabase.co/storage/v1/object/public/media/henrik/henrik-portrait.jpg"})`,
              }}
            />
          </div>
          <div className="flex-1">
            <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
              {page?.subtitle || "Founder & Creative Director"}
            </p>
            <h1 className="mb-6 font-serif text-5xl font-light md:text-6xl">
              Henrik Tidefjard
            </h1>
            {page?.body ? (
              <PageContent html={page.body} />
            ) : (
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Henrik founded BerlinAgenten as a way to share the city he
                  loved with people who wanted more than a guidebook could
                  offer — the hidden speakeasies, the industrial lofts
                  turned art galleries, the restaurants known only to locals.
                </p>
                <p>
                  That vision has grown into Agent Henrik: a global luxury
                  travel curation platform spanning ten destinations across
                  four continents. Henrik personally curates every journey,
                  drawing on a decade of relationships with local insiders,
                  cultural gatekeepers, and scene makers worldwide.
                </p>
                <p>
                  His approach is simple — every trip should feel like a
                  chapter in a story only you can live.
                </p>
              </div>
            )}
            <div className="mt-8">
              <CTAButton href="/contact">Start a Conversation</CTAButton>
            </div>
          </div>
        </div>
      </Section>

      {/* Storytellers Network */}
      {storytellers.length > 0 && (
        <Section className="bg-muted">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-serif text-4xl font-light md:text-5xl">
              Our Storytellers
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              In every destination, Agent Henrik works with local insiders
              who know the culture from the inside. They are the ones who
              open doors that stay closed to everyone else.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {storytellers.map((st) => (
              <Link
                key={st.id}
                href={`/storytellers/${st.slug}`}
                className="group"
              >
                <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-background">
                  {st.portrait_url ? (
                    <div
                      className="h-full w-full bg-cover bg-center cinematic-hover"
                      style={{ backgroundImage: `url(${st.portrait_url})` }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-background">
                      <span className="font-serif text-4xl font-light text-muted-foreground">
                        {st.name[0]}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="font-serif text-xl font-light transition-opacity group-hover:opacity-80">
                  {st.name}
                </h3>
                {st.role && (
                  <p className="text-sm text-muted-foreground">{st.role}</p>
                )}
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <CTAButton href="/storytellers" variant="outline">
              View All Storytellers
            </CTAButton>
          </div>
        </Section>
      )}

      {/* CTA */}
      <Section>
        <div className="mx-auto max-w-lg text-center">
          <h2 className="mb-4 font-serif text-4xl font-light">
            Work With Us
          </h2>
          <p className="mb-8 text-muted-foreground">
            Whether you are a local insider looking to collaborate or a
            traveller ready to begin your journey, we would love to hear
            from you.
          </p>
          <CTAButton href="/contact">Get in Touch</CTAButton>
        </div>
      </Section>
    </div>
  );
}
