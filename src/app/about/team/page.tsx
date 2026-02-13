import { Metadata } from "next";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Our Team",
  description: "Meet the team behind Agent Henrik.",
};

export default function TeamPage() {
  return (
    <div className="pt-20">
      <Section>
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-serif text-5xl font-light md:text-6xl">
            Our Team
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Cultural curators, journey architects, and insider
            specialists.
          </p>
        </div>
        <div className="py-16 text-center text-muted-foreground">
          <p>Team profiles coming soon.</p>
        </div>
      </Section>
    </div>
  );
}
