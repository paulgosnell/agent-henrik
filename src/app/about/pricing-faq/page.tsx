import { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { CTAButton } from "@/components/ui/cta-button";
import { INVESTMENT_LEVELS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Pricing & FAQ",
  description: "Investment levels and frequently asked questions about Agent Henrik journeys.",
};

const faqs = [
  {
    q: "How far in advance should I book?",
    a: "We recommend 4-8 weeks for most destinations. Peak seasons and exclusive experiences may require longer lead times.",
  },
  {
    q: "Can you plan for groups?",
    a: "Absolutely. We curate experiences for corporate retreats, celebrations, brand activations, and private groups of any size.",
  },
  {
    q: "What destinations do you cover?",
    a: "Our current Storyworld network spans 10 global destinations. We're continuously expanding our insider network.",
  },
  {
    q: "Can I combine multiple themes?",
    a: "Yes. Our AI concierge and journey curators specialize in blending themes into a single cohesive Story Arc.",
  },
  {
    q: "What's included in the price?",
    a: "Every journey is bespoke. Your quote includes curation, insider access, local coordination, and on-the-ground support. Travel and accommodation are quoted separately.",
  },
];

export default function PricingFaqPage() {
  return (
    <div className="pt-20">
      <Section>
        <div className="mb-16 text-center">
          <h1 className="mb-4 font-serif text-5xl font-light md:text-6xl">
            Pricing & FAQ
          </h1>
        </div>

        {/* Investment Levels */}
        <div className="mb-20">
          <h2 className="mb-8 text-center font-serif text-3xl font-light">
            Investment Levels
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {INVESTMENT_LEVELS.map((level) => (
              <div
                key={level.value}
                className="border border-border p-8 text-center"
              >
                <h3 className="mb-3 font-serif text-2xl font-light">
                  {level.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {level.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-center font-serif text-3xl font-light">
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-border">
            {faqs.map((faq, i) => (
              <div key={i} className="py-6">
                <h3 className="mb-2 text-sm font-medium">{faq.q}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <CTAButton href="/contact">Get Your Quote</CTAButton>
        </div>
      </Section>
    </div>
  );
}
