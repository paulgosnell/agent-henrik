import type { Metadata } from "next";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Terms & Conditions — Agent Henrik",
  description: "Terms and conditions for Agent Henrik luxury travel curation services.",
};

export default function TermsPage() {
  return (
    <div className="pt-20">
      <Section>
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">The booking rules</p>
          <h1 className="mb-12 font-serif text-4xl font-light md:text-5xl">
            Terms & Conditions
          </h1>
          <div className="space-y-8 text-sm leading-relaxed text-muted-foreground [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-light [&_h2]:text-foreground [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1">
            <div>
              <h2>1. Scope of Services</h2>
              <p>Agent Henrik, a brand of Luxury Travel Sweden AB, organises exclusive events, tours, and meetings with tailor-made service packages that are individually negotiated.</p>
              <p className="mt-2">Unless explicitly stated otherwise, Luxury Travel Sweden AB acts as the <strong>sole contractual partner</strong> and service provider. In certain cases, the company may act as an <strong>intermediary</strong> (agent) for third-party suppliers, which will be clearly identified in advance and which agency fees apply. In those instances, the contractual relationship exists directly between the customer and the third-party supplier, and their respective terms and conditions apply.</p>
            </div>

            <div>
              <h2>2. Company Ownership</h2>
              <p>The company is owned and managed by <strong>Henrik Tidefjärd</strong>, Sweden. All contractual relations are concluded with <strong>Luxury Travel Sweden AB</strong>, except in cases where the company explicitly acts as an intermediary for third parties.</p>
            </div>

            <div>
              <h2>3. Booking and Contract Formation</h2>
              <p>Bookings must be made in writing via email, message, or other verifiable form of communication.</p>
              <p className="mt-2">Each booking must specify:</p>
              <ul className="mt-2">
                <li>The number of participants</li>
                <li>The scope of services</li>
                <li>The agreed price</li>
              </ul>
              <p className="mt-2">When a booking is made on behalf of multiple participants by a company or individual, that party is liable for all obligations arising from the booking, unless otherwise agreed in writing.</p>
              <p className="mt-2">If the booking confirmation differs from the initial offer, it is considered a <strong>new offer</strong> that must be confirmed in writing by both parties.</p>
              <p className="mt-2">A contract is established once Luxury Travel Sweden AB issues a written confirmation.</p>
            </div>

            <div>
              <h2>4. Payment Terms</h2>
              <p>Payment must be received <strong>no later than 14 days before the start</strong> of the service.</p>
              <p className="mt-2">For last-minute bookings, payment is due <strong>immediately and in full</strong>.</p>
              <p className="mt-2">All payments shall be made in Swedish Krona (SEK) or Euro, unless otherwise stated.</p>
            </div>

            <div>
              <h2>5. Liability</h2>
              <p>Luxury Travel Sweden AB is responsible for:</p>
              <ul className="mt-2">
                <li>The careful organisation and execution of services</li>
                <li>The accurate description of offers</li>
                <li>The proper selection of third-party service providers</li>
              </ul>
              <p className="mt-2">However, the company is not liable for:</p>
              <ul className="mt-2">
                <li>Representations or commitments made directly by third-party providers outside the agreed scope</li>
                <li>Indirect or consequential damages</li>
                <li>Damages not involving injury to life, body, or health beyond three times the total booking price, unless caused intentionally or by gross negligence</li>
              </ul>
              <p className="mt-2">Liability for damages caused by third-party providers (e.g., transport operators, venues) is limited to the contractual and legal liability of those providers.</p>
            </div>

            <div>
              <h2>6. Cancellation and No-Show Policy</h2>
              <p>Luxury Travel Sweden AB must be compensated for all services already performed or obligated under third-party contracts before cancellation.</p>
              <p className="mt-3">The following flat-rate cancellation fees apply:</p>
              <div className="mt-3 border border-border">
                <div className="grid grid-cols-2 border-b border-border bg-muted/50 px-4 py-2 text-xs font-medium uppercase tracking-wider text-foreground">
                  <span>Time Before Event</span>
                  <span>Cancellation Fee</span>
                </div>
                <div className="grid grid-cols-2 border-b border-border px-4 py-2"><span>Up to 60 days</span><span>No charge</span></div>
                <div className="grid grid-cols-2 border-b border-border px-4 py-2"><span>59–30 days</span><span>50% of total price</span></div>
                <div className="grid grid-cols-2 border-b border-border px-4 py-2"><span>29–6 days</span><span>75% of total price</span></div>
                <div className="grid grid-cols-2 border-b border-border px-4 py-2"><span>5 days or fewer</span><span>100% of total price</span></div>
                <div className="grid grid-cols-2 px-4 py-2"><span>No-show / same-day</span><span>100% of total price</span></div>
              </div>
              <p className="mt-3">If a customer fails to appear for a scheduled activity, full payment is due.</p>
              <p className="mt-2">The guide or host will wait <strong>up to 30 minutes</strong> at the agreed meeting point. Customers must report any delays by phone within this time.</p>
              <p className="mt-2">Customers may present evidence that the actual loss incurred was lower than the above flat-rate.</p>
            </div>

            <div>
              <h2>7. Change of Booking</h2>
              <p>Changes to an existing booking are possible only if:</p>
              <ul className="mt-2">
                <li>The same service type is available on another date</li>
                <li>The number of participants and price remain unchanged</li>
              </ul>
              <p className="mt-2">If a change results in a reduced service scope, a partial refund is excluded. Article 6 applies accordingly.</p>
              <p className="mt-2">If third-party providers (e.g., ticketed events) cannot reschedule or refund, the original costs will remain payable for the replacement date.</p>
            </div>

            <div>
              <h2>8. Programme Changes and Force Majeure</h2>
              <p>Luxury Travel Sweden AB reserves the right to modify programmes due to <strong>weather conditions, force majeure</strong>, or <strong>service changes by partners</strong>.</p>
              <p className="mt-2">In such cases:</p>
              <ul className="mt-2">
                <li>If the overall service is reduced, a proportional refund applies.</li>
                <li>If the company cancels an event (e.g., due to illness of a guide and no available replacement), the full payment for that service will be reimbursed.</li>
              </ul>
              <p className="mt-2">Reimbursements are limited to the affected service(s) only. Additional costs or consequential losses (e.g., travel expenses) are excluded.</p>
              <p className="mt-2">The company may also charge additional costs arising during the contract if these exceed the original service scope. Such costs will be communicated and agreed in advance if exceeding <strong>15%</strong> of the total price.</p>
            </div>

            <div>
              <h2>9. Notification of Deficiencies</h2>
              <p>Any deficiencies or disruptions in performance must be reported <strong>immediately</strong> to the guide or to Luxury Travel Sweden AB upon discovery, allowing for prompt correction.</p>
              <p className="mt-2">Failure to notify may void any subsequent claims.</p>
              <p className="mt-2">For deficiencies involving third-party providers, Luxury Travel Sweden AB will assist in forwarding the complaint, but claims can only be asserted within the scope of the respective third-party contract.</p>
            </div>

            <div>
              <h2>10. Insurance</h2>
              <p>Luxury Travel Sweden AB maintains <strong>public liability insurance</strong> in accordance with Swedish law.</p>
              <p className="mt-2">This insurance does not cover the loss or theft of personal belongings unless caused intentionally or by gross negligence.</p>
              <p className="mt-2">The company does not compensate damages beyond the insured amount.</p>
              <p className="mt-2">Customers are encouraged to arrange their own <strong>travel and cancellation insurance</strong>.</p>
            </div>

            <div>
              <h2>11. International Services</h2>
              <p>Services are provided globally through trusted partner companies and local guides across ten destinations.</p>
              <p className="mt-2">All bookings and payments are handled exclusively by <strong>Luxury Travel Sweden AB</strong>.</p>
              <p className="mt-2">A request for information or quotation does <strong>not</strong> constitute a booking. A booking becomes binding only upon receipt of written confirmation and full payment.</p>
              <p className="mt-2"><strong>Liability for international events:</strong> Luxury Travel Sweden AB&apos;s liability for damages that do not involve personal injury is limited to <strong>three times the total price</strong>, unless the damage was caused intentionally or through gross negligence.</p>
              <p className="mt-2">If a local partner or venue operator has a lower statutory liability limit, that limitation also applies to Luxury Travel Sweden AB.</p>
            </div>

            <div>
              <h2>12. Place of Fulfilment and Jurisdiction</h2>
              <p>The place of fulfilment and exclusive legal venue for all contractual obligations is <strong>Stockholms län, Sweden</strong>.</p>
              <p className="mt-2">Swedish law applies, excluding the UN Convention on Contracts for the International Sale of Goods (CISG).</p>
            </div>

            <div>
              <h2>13. Severability Clause</h2>
              <p>If any provision of these Terms & Conditions is or becomes invalid, the remaining provisions remain unaffected.</p>
              <p className="mt-2">The invalid clause shall be replaced by a legally permissible provision closest to its intended purpose.</p>
            </div>

            <div>
              <h2>14. Contact Information</h2>
              <p><strong>Agent Henrik</strong></p>
              <p>A brand of Luxury Travel Sweden AB</p>
              <p>Attn: Henrik Tidefjärd</p>
              <p>Stockholm, Sweden</p>
              <p>henrik@agenthenrik.com</p>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
