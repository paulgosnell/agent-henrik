import type { Metadata } from "next";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Imprint — Agent Henrik",
  description: "Legal imprint for Agent Henrik.",
};

export default function ImprintPage() {
  return (
    <div className="pt-20">
      <Section>
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">Legal Notice</p>
          <h1 className="mb-4 font-serif text-4xl font-light md:text-5xl">
            Imprint
          </h1>
          <p className="mb-12 text-muted-foreground">
            This website is a product of Luxury Travel Sweden AB, operating under the Agent Henrik brand.
          </p>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground [&_strong]:text-foreground">
            <p><strong>Agent Henrik</strong> — a global luxury travel curation brand owned and operated by Henrik Tidefjärd.</p>

            <div className="space-y-2">
              <p><strong>Tel:</strong> +46 (0)70 38 722 64</p>
              <p><strong>Mail:</strong> henrik@agenthenrik.com</p>
              <p><strong>Web:</strong> agenthenrik.com</p>
            </div>

            <div className="space-y-2">
              <p><strong>Owner:</strong> Henrik Tidefjärd</p>
              <p><strong>Legal Entity:</strong> Luxury Travel Sweden AB</p>
              <p><strong>Company Type:</strong> Limited Company (AB)</p>
              <p><strong>Place of Performance and Jurisdiction:</strong> Stockholms län, Stockholm kommun</p>
              <p><strong>Organisation Number:</strong> 556856-7837</p>
              <p><strong>EU VAT Number:</strong> SE556856783701</p>
            </div>

            <div className="mt-8 border-t border-border pt-8">
              <p><strong>Copyright &copy; 2025 Luxury Travel Sweden AB</strong></p>
              <p className="mt-2">All rights reserved. The information on this website may not be reproduced, republished, or copied without prior written permission.</p>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
