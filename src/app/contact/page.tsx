import { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { Section } from "@/components/ui/section";
import { createClient } from "@/lib/supabase/server";
import type { PressItem } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Contact",
  description: "Begin your insider journey. Contact Agent Henrik for a bespoke consultation.",
};

export default async function ContactPage() {
  const supabase = await createClient();
  const { data: pressItems } = await supabase
    .from("ah_press_items")
    .select("*")
    .not("quote", "is", null)
    .order("display_order")
    .limit(3);

  const quotes = (pressItems as PressItem[]) ?? [];

  return (
    <div className="pt-20">
      <Section>
        <div className="mx-auto max-w-2xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 font-serif text-5xl font-light md:text-6xl">
              Begin Your Journey
            </h1>
            <p className="text-lg text-muted-foreground">
              Tell us about your ideal experience. Your story curator will
              contact you within 24 hours.
            </p>
          </div>

          {quotes.length > 0 && (
            <div className="mb-12 space-y-4 border-y border-border py-8">
              {quotes.map((item) => (
                <blockquote key={item.id} className="text-center">
                  <p className="font-serif text-lg italic text-muted-foreground">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <cite className="mt-1 block text-xs uppercase tracking-wider text-muted-foreground">
                    — {item.source}
                  </cite>
                </blockquote>
              ))}
            </div>
          )}

          <ContactForm />
        </div>
      </Section>
    </div>
  );
}
