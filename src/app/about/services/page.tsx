import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Section } from "@/components/ui/section";
import { CTAButton } from "@/components/ui/cta-button";
import type { Service } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Our Services",
  description: "Agent Henrik's seven core service offerings for individuals, brands, and groups.",
};

export default async function ServicesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ah_services")
    .select("*")
    .eq("published", true)
    .order("display_order");

  const services = (data as Service[]) || [];

  return (
    <div className="pt-20">
      <Section>
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-serif text-5xl font-light md:text-6xl">
            Our Services
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Seven ways we craft your insider journey.
          </p>
        </div>

        {services.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2">
            {services.map((service) => (
              <div key={service.id} className="border border-border p-8">
                <h3 className="mb-3 font-serif text-2xl font-light">
                  {service.title}
                </h3>
                {service.description && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground">
            <p>Service details coming soon.</p>
          </div>
        )}

        <div className="mt-12 text-center">
          <CTAButton href="/contact">Start Your Journey</CTAButton>
        </div>
      </Section>
    </div>
  );
}
