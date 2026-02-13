import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ArticleCard } from "@/components/journal/article-card";
import { Section } from "@/components/ui/section";
import type { JournalArticle } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Journal",
  description: "The Insider Journal. City spotlights, scene reports, and insider interviews.",
};

export default async function JournalPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ah_journal_articles")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  const articles = (data as JournalArticle[]) || [];

  return (
    <div className="pt-20">
      <Section>
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-serif text-5xl font-light md:text-6xl">
            The Insider Journal
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            City spotlights, scene reports, and insider interviews from the
            underground.
          </p>
        </div>

        {articles.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground">
            <p>Journal articles coming soon.</p>
          </div>
        )}
      </Section>
    </div>
  );
}
