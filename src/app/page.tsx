import { createClient } from "@/lib/supabase/server";
import { HeroVideo } from "@/components/hero/hero-video";
import { BentoGrid } from "@/components/experiences/bento-grid";
import { LogoStrip } from "@/components/press/logo-strip";
import { ArticleCard } from "@/components/journal/article-card";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { Section } from "@/components/ui/section";
import { CTAButton } from "@/components/ui/cta-button";
import { InstagramFeed } from "@/components/instagram/instagram-feed";
import { Instagram, MapPin, Users } from "lucide-react";
import type { Theme } from "@/lib/supabase/types";
import type { JournalArticle } from "@/lib/supabase/types";

export default async function HomePage() {
  const supabase = await createClient();

  const [themesResult, articlesResult] = await Promise.all([
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
  ]);

  const themes = (themesResult.data as Theme[]) || [];
  const articles = (articlesResult.data as JournalArticle[]) || [];

  return (
    <>
      {/* Hero */}
      <HeroVideo />

      {/* Experience Themes Teaser */}
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

      {/* Map Explorer Teaser */}
      <Section className="bg-muted">
        <div className="flex flex-col items-center gap-8 md:flex-row md:gap-16">
          <div className="flex-1">
            <h2 className="mb-4 font-serif text-4xl font-light md:text-5xl">
              Explore the Storyworld
            </h2>
            <p className="mb-6 max-w-md text-muted-foreground">
              Ten cities. Ten narratives. Each destination is a chapter in a
              story only you can live.
            </p>
            <CTAButton href="/explore">
              <MapPin size={14} />
              Open Map
            </CTAButton>
          </div>
          <div className="relative aspect-video w-full flex-1 overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-80 transition-opacity hover:opacity-100"
              style={{ backgroundImage: "url(https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&q=80)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-muted via-transparent to-transparent" />
          </div>
        </div>
      </Section>

      {/* Press Strip */}
      <LogoStrip />

      {/* Corporate & Groups Teaser */}
      <Section>
        <div className="grid gap-0 md:grid-cols-2">
          <div className="relative flex flex-col items-start justify-end p-8 md:p-12 min-h-[400px]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url(https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="relative z-10 text-white">
              <h3 className="mb-3 font-serif text-3xl font-light">
                For Individuals
              </h3>
              <p className="mb-6 max-w-sm text-sm text-white/70">
                Bespoke journeys crafted around your story. Underground culture,
                insider access, and cinematic moments designed for the discerning
                traveler.
              </p>
              <CTAButton href="/experiences" variant="outline">
                Explore Journeys
              </CTAButton>
            </div>
          </div>
          <div className="relative flex flex-col items-start justify-end p-8 md:p-12 min-h-[400px]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url(https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="relative z-10 text-white">
              <h3 className="mb-3 font-serif text-3xl font-light">
                For Brands & Groups
              </h3>
              <p className="mb-6 max-w-sm text-sm text-white/70">
                Innovation retreats, trend-scouting expeditions, and brand
                activations in the world&apos;s most extraordinary spaces.
              </p>
              <CTAButton href="/contact" variant="outline">
                <Users size={14} />
                Get in Touch
              </CTAButton>
            </div>
          </div>
        </div>
      </Section>

      {/* Journal Preview */}
      {articles.length > 0 && (
        <Section className="bg-muted">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-serif text-4xl font-light md:text-5xl">
              The Insider Journal
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              City spotlights, scene reports, and insider interviews from the
              underground.
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

      {/* Newsletter Signup */}
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

      {/* Instagram */}
      <Section className="bg-muted">
        <div className="text-center">
          <h2 className="mb-4 font-serif text-4xl font-light md:text-5xl">
            Follow the Journey
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
            Behind-the-scenes moments, underground discoveries, and cinematic glimpses from the field.
          </p>
          {/* TODO: @agenthenrik Instagram is currently private. Switch to <InstagramFeed username="agenthenrik" limit={8} /> once public. */}
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
    </>
  );
}
