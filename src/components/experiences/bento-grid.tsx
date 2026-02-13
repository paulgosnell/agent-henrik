import type { Theme } from "@/lib/supabase/types";
import { ThemeCard } from "./theme-card";

interface BentoGridProps {
  themes: Theme[];
}

// Layout pattern: 2 large, 3 medium, 5 small across a 3-column grid
function getSize(index: number): "large" | "medium" | "small" {
  if (index < 2) return "large";
  if (index < 5) return "medium";
  return "small";
}

export function BentoGrid({ themes }: BentoGridProps) {
  return (
    <div className="grid auto-rows-auto grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {themes.map((theme, i) => (
        <ThemeCard key={theme.id} theme={theme} size={getSize(i)} />
      ))}
    </div>
  );
}
