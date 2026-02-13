import { Metadata } from "next";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <div className="pt-20">
      <Section>
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-8 font-serif text-4xl font-light md:text-5xl">
            Terms & Conditions
          </h1>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>Terms and conditions content will be provided by the client.</p>
          </div>
        </div>
      </Section>
    </div>
  );
}
