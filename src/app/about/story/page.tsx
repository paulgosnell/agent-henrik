import { Metadata } from "next";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Our Story",
  description: "The story behind Agent Henrik — from Berlin to the world.",
};

export default function StoryPage() {
  return (
    <div className="pt-20">
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mb-6 font-serif text-5xl font-light md:text-6xl">
            Our Story
          </h1>
          <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
            Agent Henrik began as BerlinAgenten — a single city, a single
            vision: to reveal the underground culture that guidebooks
            miss. What started in Berlin&apos;s hidden speakeasies and
            industrial lofts has grown into a global network of insider
            journeys.
          </p>
          <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
            Today, Agent Henrik curates bespoke cultural experiences
            across ten of the world&apos;s most extraordinary destinations.
            Every journey follows our Story Arc model — a cinematic
            narrative structure that transforms travel into storytelling.
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground">
            We don&apos;t sell trips. We craft chapters in your life story.
          </p>
        </div>
      </Section>
    </div>
  );
}
