import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Section } from "@/components/ui/section";
import { CTAButton } from "@/components/ui/cta-button";
import type { JournalArticle } from "@/lib/supabase/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("ah_journal_articles").select("title, excerpt").eq("slug", slug).single();
  if (!data) return { title: "Article" };
  return {
    title: data.title,
    description: data.excerpt || `Read ${data.title} on Agent Henrik's Insider Journal.`,
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("ah_journal_articles").select("*").eq("slug", slug).single();

  if (!data) notFound();

  const article = data as JournalArticle;

  return (
    <article className="pt-20">
      {/* Hero */}
      <section className="relative flex h-[50vh] items-end">
        {article.hero_image_url && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${article.hero_image_url})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-6 pb-12 md:px-12">
          {article.category && (
            <span className="nav-text mb-2 block text-white/60">
              {article.category}
            </span>
          )}
          <h1 className="font-serif text-4xl font-light text-white md:text-6xl">
            {article.title}
          </h1>
        </div>
      </section>

      {/* Content */}
      <Section>
        <div className="mx-auto max-w-[700px]">
          {article.content ? (
            <div
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <p className="text-muted-foreground">Article content coming soon.</p>
          )}
        </div>
      </Section>

      {/* CTA */}
      <Section className="bg-muted">
        <div className="text-center">
          <h2 className="mb-4 font-serif text-3xl font-light">
            Want to Live This Story?
          </h2>
          <CTAButton href="/liv">Design My Journey with Agent Henrik</CTAButton>
        </div>
      </Section>
    </article>
  );
}
