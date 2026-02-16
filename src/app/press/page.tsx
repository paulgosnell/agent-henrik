import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PressCard } from "@/components/press/press-card";
import { Section } from "@/components/ui/section";
import type { PressItem } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Press & Media",
  description: "Agent Henrik in the press. Features, interviews, and media coverage.",
};

export default async function PressPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ah_press_items")
    .select("*")
    .order("display_order");

  const pressItems = (data as PressItem[]) || [];

  return (
    <div className="pt-20">
      <Section>
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-serif text-5xl font-light md:text-6xl">
            Press & Media
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Featured in the world&apos;s leading publications.
          </p>
        </div>

        {/* Editorial Pull Quotes */}
        {(() => {
          const quoted = pressItems.filter((item) => item.quote);
          if (quoted.length === 0) return null;
          const featured = quoted.slice(0, 3);
          return (
            <div className="mb-16 space-y-12">
              {featured.map((item) => (
                <blockquote key={item.id} className="mx-auto max-w-3xl text-center">
                  <p className="font-serif text-2xl font-light leading-relaxed md:text-3xl">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <cite className="nav-text mt-4 block text-sm not-italic text-muted-foreground">
                    {item.source}
                  </cite>
                </blockquote>
              ))}
            </div>
          );
        })()}

        {/* Press Grid */}
        {pressItems.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pressItems.map((item) => (
              <PressCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground">
            <p>Press coverage coming soon.</p>
          </div>
        )}
      </Section>
    </div>
  );
}
