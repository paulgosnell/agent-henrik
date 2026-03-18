import { getPageMeta } from "@/lib/utils/page-meta";
import { getPageContent } from "@/lib/utils/page-content";
import { Section } from "@/components/ui/section";
import { PageContent } from "@/components/ui/page-content";

export async function generateMetadata() {
  return getPageMeta("/legal/terms", {
    title: "Terms & Conditions",
    description: "Terms and conditions for Agent Henrik luxury travel curation services.",
  });
}

export default async function TermsPage() {
  const page = await getPageContent("/legal/terms");

  return (
    <div className="pt-20">
      <Section>
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">
            {page?.subtitle || "The booking rules"}
          </p>
          <h1 className="mb-12 font-serif text-4xl font-light md:text-5xl">
            Terms & Conditions
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
