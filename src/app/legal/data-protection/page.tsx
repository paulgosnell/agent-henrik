import { Metadata } from "next";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = { title: "Data Protection" };

export default function DataProtectionPage() {
  return (
    <div className="pt-20">
      <Section>
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-8 font-serif text-4xl font-light md:text-5xl">
            Data Protection
          </h1>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>Privacy policy and GDPR compliance details will be provided by the client.</p>
          </div>
        </div>
      </Section>
    </div>
  );
}
