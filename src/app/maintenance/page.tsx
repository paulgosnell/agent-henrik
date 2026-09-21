import type { Metadata } from "next";
import Link from "next/link";
import { Wrench } from "lucide-react";
import { MAINTENANCE_MESSAGE } from "@/lib/maintenance";

export const metadata: Metadata = {
  title: "System maintenance",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-[var(--background)]">
      <div className="max-w-md w-full text-center rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-8">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--background)]">
          <Wrench className="h-6 w-6 text-[var(--foreground)]" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-semibold text-[var(--foreground)]">System maintenance</h1>
        <p className="mt-3 text-[var(--foreground)]">{MAINTENANCE_MESSAGE}</p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Your data is safe. Nothing is lost, it is just unavailable for a few hours.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm text-[var(--muted-foreground)] underline underline-offset-4 hover:text-[var(--foreground)]"
        >
          Back to the homepage
        </Link>
      </div>
    </main>
  );
}
