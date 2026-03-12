import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HeroVideo } from "@/components/hero/hero-video";
import { BentoGrid } from "@/components/experiences/bento-grid";
import { ArticleCard } from "@/components/journal/article-card";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { ContactForm } from "@/components/contact/contact-form";
import { Section } from "@/components/ui/section";
import { CTAButton } from "@/components/ui/cta-button";
import { MiniMapLoader } from "@/components/map/mini-map-loader";
import { Instagram, MapPin, MessageCircle, ArrowRight } from "lucide-react";
import type { Theme, Storyworld, JournalArticle, Storyteller } from "@/lib/supabase/types";

export default async function HomePage() {
  const supabase = await createClient();

  const [themesResult, articlesResult, storytellersResult, pressResult, storyworldsResult] = await Promise.all([
    supabase
      .from("ah_themes")
      .select("*")
      .eq("published", true)
      .order("display_order"),
    supabase
      .from("ah_journal_articles")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(3),
    supabase
      .from("ah_storytellers")
      .select("*")
      .eq("published", true)
      .limit(6),
    supabase
      .from("ah_press_items")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(6),
    supabase
      .from("ah_storyworlds")
      .select("*")
      .eq("published", true)
      .order("display_order"),
  ]);

  const themes = (themesResult.data as Theme[]) || [];
  const articles = (articlesResult.data as JournalArticle[]) || [];
  const storytellers = (storytellersResult.data as Storyteller[]) || [];
  const pressItems = pressResult.data || [];
  const storyworlds = (storyworldsResult.data as Storyworld[]) || [];

  return (
    <>
      {/* 1. Hero Video with 3 Entry Paths */}
      <HeroVideo
        headline="Your Insider Journey Begins Here"
        ctaHref="#explore"
      />

      {/* 2. Storyworld Map Teaser */}
      <Section id="explore" className="bg-muted">
        <div className="flex flex-col items-center gap-8 md:flex-row md:gap-16">
          <div className="flex-1">
            <h2 className="mb-4 font-serif text-4xl font-light md:text-5xl">
              Explore the Storyworld
            </h2>
            <p className="mb-6 max-w-md text-muted-foreground">
              Each destination is a chapter in a story only you can live.
            </p>
            <CTAButton href="/explore">
              <MapPin size={14} />
              Open Map
            </CTAButton>
          </div>
          <div className="relative aspect-video w-full flex-1 overflow-hidden rounded-lg border border-border">
            <MiniMapLoader storyworlds={storyworlds} />
          </div>
        </div>
      </Section>

      {/* 3. Experience Themes */}
      <Section id="experiences">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-serif text-4xl font-light md:text-5xl">
            Ten Ways to Experience the World
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Every journey is shaped by theme, mood, and moment. Choose your lens.
          </p>
        </div>
        {themes.length > 0 ? (
          <BentoGrid themes={themes} />
        ) : (
          <div className="py-16 text-center text-muted-foreground">
            <p>Experiences coming soon.</p>
          </div>
        )}
        <div className="mt-8 text-center">
          <CTAButton href="/experiences">View All Experiences</CTAButton>
        </div>
      </Section>

      {/* 4. Storytellers */}
      <Section id="storytellers" className="bg-muted">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-serif text-4xl font-light md:text-5xl">
            Our Storytellers
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Local insiders, cultural curators, and scene makers who bring each destination to life.
          </p>
        </div>
        {storytellers.length > 0 ? (
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
        ) : (
          <div className="py-16 text-center text-muted-foreground">
            <p>Storyteller profiles coming soon.</p>
          </div>
        )}
        <div className="mt-8 text-center">
          <CTAButton href="/storytellers" variant="outline">View All Storytellers</CTAButton>
        </div>
      </Section>

      {/* 5. AH Concierge Teaser */}
      <Section id="concierge">
        <div className="flex flex-col items-center gap-12 md:flex-row md:gap-16">
          <div className="flex-1">
            <h2 className="mb-4 font-serif text-4xl font-light md:text-5xl">
              Design Your Journey
            </h2>
            <p className="mb-4 text-muted-foreground">
              Agent Henrik is your AI-powered luxury travel architect. Share your vision — destinations, themes, pace — and receive a bespoke itinerary crafted around your story.
            </p>
            <ul className="mb-8 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <ArrowRight size={12} className="shrink-0" />
                Understands 10 global destinations and 10 experience themes
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight size={12} className="shrink-0" />
                Blends multiple themes into one coherent journey
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight size={12} className="shrink-0" />
                Generates day-by-day itineraries with curated venues
              </li>
            </ul>
            <CTAButton href="/liv">
              <MessageCircle size={14} />
              Start a Conversation
            </CTAButton>
          </div>
          <div className="relative flex-1">
            <div className="border border-border bg-muted p-8">
              <p className="mb-4 font-serif text-lg font-light italic text-muted-foreground">
                &ldquo;Create a 4-day journey in Beirut blending Culinary Journeys with Celebration &amp; Nightlife. Elegant, curated, not chaotic.&rdquo;
              </p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Try a prompt like this
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* 6. Journal Preview */}
      {articles.length > 0 && (
        <Section id="journal" className="bg-muted">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-serif text-4xl font-light md:text-5xl">
              The Insider Journal
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              City spotlights, scene reports, and insider interviews from the underground.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <CTAButton href="/journal" variant="outline">
              Read the Journal
            </CTAButton>
          </div>
        </Section>
      )}

      {/* 7. Newsletter Signup */}
      <Section>
        <div className="mx-auto max-w-lg text-center">
          <h2 className="mb-4 font-serif text-4xl font-light">
            Join the Insider Circle
          </h2>
          <p className="mb-8 text-muted-foreground">
            Receive curated dispatches from the world&apos;s hidden cultural scenes.
          </p>
          <NewsletterForm />
        </div>
      </Section>

      {/* 8. Press & Media */}
      {pressItems.length > 0 && (
        <Section id="press" className="bg-muted">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-serif text-4xl font-light md:text-5xl">
              Press & Media
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pressItems.map((item: { id: string; title: string; publication?: string; thumbnail_url?: string; slug?: string }) => (
              <div key={item.id} className="border border-border p-6 transition-colors hover:bg-background">
                {item.thumbnail_url && (
                  <div
                    className="mb-4 aspect-video bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.thumbnail_url})` }}
                  />
                )}
                <h3 className="font-serif text-lg font-light">{item.title}</h3>
                {item.publication && (
                  <p className="mt-1 text-sm text-muted-foreground">{item.publication}</p>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <CTAButton href="/press" variant="outline">View All Press</CTAButton>
          </div>
        </Section>
      )}

      {/* 9. Instagram */}
      <Section>
        <div className="text-center">
          <h2 className="mb-4 font-serif text-4xl font-light md:text-5xl">
            Follow the Journey
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
            Behind-the-scenes moments, underground discoveries, and cinematic glimpses from the field.
          </p>
          <div className="mx-auto mb-8 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
            {[
              "photo-1507003211169-0a1dd7228f2d",
              "photo-1502602898657-3e91760cbb34",
              "photo-1517760444937-f6397edcbbcd",
              "photo-1470219556762-1fd5b25f15e8",
              "photo-1516483638261-f4dbaf036963",
              "photo-1555939594-58d7cb561ad1",
              "photo-1506929562872-bb421503ef21",
              "photo-1476514525535-07fb3b4ae5f1",
            ].map((id, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden">
                <div
                  className="h-full w-full bg-cover bg-center transition-transform duration-600 group-hover:scale-105"
                  style={{ backgroundImage: `url(https://images.unsplash.com/${id}?w=400&q=80)` }}
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-400 group-hover:bg-black/20" />
              </div>
            ))}
          </div>
          <div className="mt-0">
            <a
              href="https://instagram.com/agenthenrik"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-text inline-flex items-center gap-2 border border-border px-8 py-3 transition-all duration-400 hover:bg-foreground hover:text-background"
            >
              <Instagram size={14} />
              @agenthenrik
            </a>
          </div>
        </div>
      </Section>

      {/* 10. Contact */}
      <Section id="contact" className="bg-muted">
        <div className="flex flex-col gap-12 md:flex-row md:gap-16">
          <div className="flex-1">
            <h2 className="mb-4 font-serif text-4xl font-light md:text-5xl">
              Start Your Journey
            </h2>
            <p className="mb-6 text-muted-foreground">
              Share your vision and let Agent Henrik craft your bespoke luxury experience.
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Henrik Tidefjard</p>
              <p>Founder & Creative Director</p>
              <p>+46 (0)70 38 722 64</p>
              <p>henrik@agenthenrik.com</p>
            </div>
          </div>
          <div className="flex-1">
            <ContactForm />
          </div>
        </div>
      </Section>
    </>
  );
}
