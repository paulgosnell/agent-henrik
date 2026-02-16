import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPageMeta } from "@/lib/utils/page-meta";
import { Section } from "@/components/ui/section";
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

        {storytellers.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {storytellers.map((st) => (
              <Link
                key={st.id}
                href={`/storytellers/${st.slug}`}
                className="group"
              >
                <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-muted">
                  {st.portrait_url ? (
                    <div
                      className="h-full w-full bg-cover bg-center cinematic-hover"
                      style={{ backgroundImage: `url(${st.portrait_url})` }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
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
      </Section>
    </div>
  );
}
