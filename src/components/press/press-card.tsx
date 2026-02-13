import type { PressItem } from "@/lib/supabase/types";

interface PressCardProps {
  item: PressItem;
}

export function PressCard({ item }: PressCardProps) {
  return (
    <div className="group overflow-hidden border border-border">
      {/* Thumbnail */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {item.thumbnail_url ? (
          <div
            className="h-full w-full bg-cover bg-center grayscale transition-all duration-600 group-hover:grayscale-0"
            style={{ backgroundImage: `url(${item.thumbnail_url})` }}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-serif text-2xl font-light text-muted-foreground">
              {item.source}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="nav-text text-xs text-muted-foreground">{item.source}</p>
        <h3 className="mt-1 font-serif text-lg font-light">{item.title}</h3>
        {item.quote && (
          <blockquote className="mt-2 border-l-2 border-border pl-3 text-sm italic text-muted-foreground">
            &ldquo;{item.quote}&rdquo;
          </blockquote>
        )}
      </div>
    </div>
  );
}
