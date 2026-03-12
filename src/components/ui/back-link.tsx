"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackLink() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 md:px-12">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
      >
        <ArrowLeft size={14} />
        Back
      </button>
    </div>
  );
}
