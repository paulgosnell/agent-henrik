import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 font-serif text-6xl font-light md:text-8xl">404</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        This page doesn&apos;t exist — but your next journey does.
      </p>
      <Link
        href="/"
        className="nav-text inline-flex items-center gap-2 border border-border px-6 py-3 transition-colors hover:bg-foreground hover:text-background"
      >
        <ArrowLeft size={14} />
        Return Home
      </Link>
    </div>
  );
}
