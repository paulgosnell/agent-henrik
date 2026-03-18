import { getPageMeta } from "@/lib/utils/page-meta";
import { getPageContent } from "@/lib/utils/page-content";
import { Section } from "@/components/ui/section";
import { PageContent } from "@/components/ui/page-content";

export async function generateMetadata() {
  return getPageMeta("/legal/data-protection", {
    title: "Data Protection",
    description: "Data protection and privacy policy for Agent Henrik.",
  });
}

export default async function DataProtectionPage() {
  const page = await getPageContent("/legal/data-protection");

  return (
    <div className="pt-20">
      <Section>
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">
            {page?.subtitle || "How we handle your information"}
          </p>
          <h1 className="mb-12 font-serif text-4xl font-light md:text-5xl">
            Data Protection Notice
          </h1>
          {page?.body ? (
            <PageContent html={page.body} />
          ) : (
            <p className="text-sm text-muted-foreground">Content coming soon.</p>
          )}
        </div>
      </Section>
    </div>
  );
}
