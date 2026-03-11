import { createClient } from "@/lib/supabase/server";
import { getPageMeta } from "@/lib/utils/page-meta";
import { Section } from "@/components/ui/section";
import { StorytellerFilter } from "@/components/storytellers/storyteller-filter";
import type { Storyteller } from "@/lib/supabase/types";

export async function generateMetadata() {
  return getPageMeta("/storytellers", {
    title: "Storytellers",
    description: "Meet Agent Henrik's global network of cultural storytellers and local insiders.",
  });
}

export default async function StorytellersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ah_storytellers")
    .select("*")
    .eq("published", true);

  const storytellers = (data as Storyteller[]) || [];

  return (
    <div className="pt-20">
      <Section>
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-serif text-5xl font-light md:text-6xl">
            Our Storytellers
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Local insiders, cultural curators, and scene makers who bring each
            destination to life.
          </p>
        </div>

        <StorytellerFilter storytellers={storytellers} />
      </Section>
    </div>
  );
}
