import type { Metadata } from "next";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Data Protection — Agent Henrik",
  description: "Data protection and privacy policy for Agent Henrik.",
};

export default function DataProtectionPage() {
  return (
    <div className="pt-20">
      <Section>
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">Be aware of</p>
          <h1 className="mb-4 font-serif text-4xl font-light md:text-5xl">
            Data Protection Notice
          </h1>
          <p className="mb-12 text-muted-foreground">
            At Agent Henrik (operated by Luxury Travel Sweden AB), we take your privacy and data protection seriously. This notice explains how we collect, use, store, and protect your personal data when you visit our website or use our services.
          </p>
          <div className="space-y-8 text-sm leading-relaxed text-muted-foreground [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-light [&_h2]:text-foreground [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1">
            <div>
              <h2>1. General Principles</h2>
              <p>Luxury Travel Sweden AB complies with the <strong>EU General Data Protection Regulation (GDPR)</strong>, the <strong>Swedish Data Protection Act</strong>, and other applicable European privacy regulations.</p>
              <p className="mt-2">We only process your personal data in a lawful, fair, and transparent manner, and only for clearly defined purposes.</p>
            </div>

            <div>
              <h2>2. Collection and Processing of Personal Data</h2>
              <p>You may use our website without disclosing personal information.</p>
              <p className="mt-2">However, personal data may be collected when you:</p>
              <ul className="mt-2">
                <li>Register for our newsletter or insider circle</li>
                <li>Submit a contact form or inquiry</li>
                <li>Make a booking or request a service</li>
                <li>Interact with our AI concierge</li>
              </ul>
              <p className="mt-2">By providing your information, you consent to the electronic storage and processing of your personal data for these specific purposes.</p>
              <p className="mt-2">Your data will <strong>not be shared with third parties</strong> unless this is necessary for providing our services (e.g., payment processors, newsletter delivery systems) or required by law.</p>
              <p className="mt-2">You can withdraw your consent and request deletion of your personal data at any time by contacting us at henrik@agenthenrik.com.</p>
            </div>

            <div>
              <h2>3. Data Retention</h2>
              <p>Your data will be retained only for as long as necessary to fulfil the purposes for which it was collected, or as required by legal obligations (such as tax or accounting laws).</p>
              <p className="mt-2">When data is no longer needed, it will be securely deleted or anonymised.</p>
            </div>

            <div>
              <h2>4. Your Rights</h2>
              <p>Under GDPR, you have the right to:</p>
              <ul className="mt-2">
                <li>Access your stored personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion (&ldquo;right to be forgotten&rdquo;)</li>
                <li>Restrict or object to data processing</li>
                <li>Request data portability in a structured, machine-readable format</li>
              </ul>
              <p className="mt-2">To exercise these rights, contact us at henrik@agenthenrik.com.</p>
              <p className="mt-2">We will respond within <strong>30 days</strong> in accordance with GDPR requirements.</p>
            </div>

            <div>
              <h2>5. Use and Disclosure of Personal Data</h2>
              <p>If you register through our website, we may share your data only with trusted service providers (for example, email newsletter services or travel partners) strictly for operational purposes.</p>
              <p className="mt-2">We do not sell or otherwise share personal data for marketing purposes.</p>
              <p className="mt-2">Any consent you provide for receiving marketing materials can be withdrawn at any time.</p>
            </div>

            <div>
              <h2>6. Use of Cookies</h2>
              <p>Our website uses cookies and similar technologies to:</p>
              <ul className="mt-2">
                <li>Ensure the website functions properly</li>
                <li>Improve your browsing experience</li>
                <li>Analyse site usage and traffic</li>
              </ul>
              <p className="mt-2">You can control or disable cookies through your browser settings. Note that disabling cookies may limit some website functionality.</p>
            </div>

            <div>
              <h2>7. Data Security</h2>
              <p>We use state-of-the-art <strong>SSL encryption</strong> and follow strict <strong>technical and organizational security measures</strong> to protect your personal data from unauthorized access, alteration, loss, or misuse.</p>
              <p className="mt-2">Despite our efforts, please note that transmission of data over the internet can never be completely secure.</p>
            </div>

            <div>
              <h2>8. External Links</h2>
              <p>Our website may contain links to third-party websites.</p>
              <p className="mt-2">Luxury Travel Sweden AB has no control over and accepts no responsibility for the privacy practices or content of these external sites. Please refer to the respective data protection policies of those websites.</p>
            </div>

            <div>
              <h2>9. Children&apos;s Privacy</h2>
              <p>Our services are <strong>not directed at individuals under 18 years of age</strong>.</p>
              <p className="mt-2">We do not knowingly collect personal data from minors.</p>
              <p className="mt-2">If you believe your child has provided us with personal data, please contact us immediately so we can delete it.</p>
            </div>

            <div>
              <h2>10. Updates to This Data Protection Notice</h2>
              <p>We may update this Data Protection Notice periodically to reflect changes in laws, technology, or business practices.</p>
              <p className="mt-2">Significant updates will be communicated on our website and, where appropriate, by email.</p>
              <p className="mt-2">The most recent version will always be available on this page.</p>
            </div>

            <div>
              <h2>11. Contact Information</h2>
              <p>If you have questions or concerns regarding your personal data, please contact our <strong>Data Protection Officer</strong>:</p>
              <p className="mt-2"><strong>Henrik Tidefjärd</strong></p>
              <p>Responsible for Data Protection</p>
              <p><strong>Agent Henrik</strong> (Luxury Travel Sweden AB)</p>
              <p>henrik@agenthenrik.com</p>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
