import { getPageMeta } from "@/lib/utils/page-meta";
import { getPageContent } from "@/lib/utils/page-content";
import { Section } from "@/components/ui/section";
import { PageContent } from "@/components/ui/page-content";

export async function generateMetadata() {
  return getPageMeta("/legal/imprint", {
    title: "Imprint",
    description: "Legal imprint for Agent Henrik.",
  });
}

export default async function ImprintPage() {
  const page = await getPageContent("/legal/imprint");

  return (
    <div className="pt-20">
      <Section>
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">
            {page?.subtitle || "Legal information"}
          </p>
          <h1 className="mb-12 font-serif text-4xl font-light md:text-5xl">
            Imprint
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
