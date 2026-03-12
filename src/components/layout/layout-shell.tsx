"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ConciergeButton } from "@/components/concierge/concierge-button";
import { BackLink } from "@/components/ui/back-link";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isHomepage = pathname === "/";
  const isLiv = pathname === "/liv";

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      {!isHomepage && !isLiv && <BackLink />}
      <Footer />
      <ConciergeButton />
    </>
  );
}
