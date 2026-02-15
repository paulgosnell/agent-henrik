import type { Theme } from "@/lib/supabase/types";
import { ThemeCard } from "./theme-card";

interface BentoGridProps {
  themes: Theme[];
}

// Layout: large(2col) + medium(1col) | medium(1col) + large(2col) | then small
// This fills the 3-column grid with no gaps
function getSize(index: number): "large" | "medium" | "small" {
  // Row 1: large + medium = 3 cols
  if (index === 0) return "large";
  if (index === 1) return "medium";
  // Row 2: medium + large = 3 cols
  if (index === 2) return "medium";
  if (index === 3) return "large";
  // Row 3: 3 medium = 3 cols
  if (index <= 6) return "medium";
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
