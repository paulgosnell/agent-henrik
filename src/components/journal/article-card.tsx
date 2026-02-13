import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { JournalArticle } from "@/lib/supabase/types";

interface ArticleCardProps {
  article: JournalArticle;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link
      href={`/journal/${article.slug}`}
      className="group block overflow-hidden"
    >
      {/* Image */}
      <div className="relative mb-4 aspect-[3/2] overflow-hidden bg-muted">
        {article.hero_image_url && (
          <div
            className="h-full w-full bg-cover bg-center cinematic-hover"
            style={{ backgroundImage: `url(${article.hero_image_url})` }}
          />
        )}
      </div>

      {/* Content */}
      {article.category && (
        <span className="nav-text text-xs text-muted-foreground">
          {article.category}
        </span>
      )}
      <h3 className="mt-1 font-serif text-xl font-light transition-opacity group-hover:opacity-80 md:text-2xl">
        {article.title}
      </h3>
      {article.excerpt && (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {article.excerpt}
        </p>
      )}
      <span className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-foreground">
        Read More <ArrowRight size={12} />
      </span>
    </Link>
  );
}
