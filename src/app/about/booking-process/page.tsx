import { getPageMeta } from "@/lib/utils/page-meta";
import { Section } from "@/components/ui/section";
import { CTAButton } from "@/components/ui/cta-button";

export async function generateMetadata() {
  return getPageMeta("/about/booking-process", {
    title: "Booking Process",
    description: "How booking with Agent Henrik works — from first conversation to departure.",
  });
}

const steps = [
  {
    number: "01",
    title: "Connect",
    description: "Reach out via our contact form or AI concierge. Share your vision, dates, and preferences.",
  },
  {
    number: "02",
    title: "Curate",
    description: "Your story curator designs a bespoke itinerary following our Story Arc model — Arrival, Immersion, Climax, Reflection.",
  },
  {
    number: "03",
    title: "Refine",
    description: "Review your journey draft. We refine every detail until it feels exactly right.",
  },
  {
    number: "04",
    title: "Confirm",
    description: "Lock in your dates, finalize logistics, and prepare for departure.",
  },
  {
    number: "05",
    title: "Experience",
    description: "Live your story. On-the-ground support ensures every moment unfolds seamlessly.",
  },
];

export default function BookingProcessPage() {
  return (
    <div className="pt-20">
      <Section>
        <div className="mb-16 text-center">
          <h1 className="mb-4 font-serif text-5xl font-light md:text-6xl">
            How It Works
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            From first conversation to departure — every step is personal.
          </p>
        </div>

        <div className="mx-auto max-w-2xl space-y-12">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-6">
              <span className="font-serif text-4xl font-light text-muted-foreground">
                {step.number}
              </span>
              <div>
                <h3 className="mb-2 font-serif text-2xl font-light">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <CTAButton href="/contact">Begin Your Journey</CTAButton>
        </div>
      </Section>
    </div>
  );
}
