import { getPageMeta } from "@/lib/utils/page-meta";
import { getPageContent } from "@/lib/utils/page-content";
import { Section } from "@/components/ui/section";
import { PageContent } from "@/components/ui/page-content";

export async function generateMetadata() {
  return getPageMeta("/about/story", {
    title: "Our Story",
    description: "The story behind Agent Henrik — from Berlin to the world.",
  });
}

export default async function StoryPage() {
  const page = await getPageContent("/about/story");

  return (
    <div className="pt-20">
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mb-6 font-serif text-5xl font-light md:text-6xl">
            Our Story
          </h1>
          {page?.image_url && (
            <div
              className="mb-8 aspect-[16/9] w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${page.image_url})` }}
            />
          )}
          {page?.body ? (
            <PageContent html={page.body} />
          ) : (
            <>
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
            </>
          )}
        </div>
      </Section>
    </div>
  );
}
