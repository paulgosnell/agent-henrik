import { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Contact",
  description: "Begin your insider journey. Contact Agent Henrik for a bespoke consultation.",
};

export default function ContactPage() {
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

          {/* Testimonials */}
          <div className="mb-12 space-y-4 border-y border-border py-8">
            <blockquote className="text-center">
              <p className="font-serif text-lg italic text-muted-foreground">
                &ldquo;Redefines what luxury travel means.&rdquo;
              </p>
              <cite className="mt-1 block text-xs uppercase tracking-wider text-muted-foreground">
                — Forbes
              </cite>
            </blockquote>
            <blockquote className="text-center">
              <p className="font-serif text-lg italic text-muted-foreground">
                &ldquo;The most exclusive cultural journeys in the world.&rdquo;
              </p>
              <cite className="mt-1 block text-xs uppercase tracking-wider text-muted-foreground">
                — The New York Times
              </cite>
            </blockquote>
          </div>

          <ContactForm />
        </div>
      </Section>
    </div>
  );
}
