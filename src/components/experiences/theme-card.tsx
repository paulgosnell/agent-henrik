import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Theme } from "@/lib/supabase/types";

interface ThemeCardProps {
  theme: Theme;
  size?: "large" | "medium" | "small";
}

export function ThemeCard({ theme, size = "small" }: ThemeCardProps) {
  const sizeClasses = {
    large: "col-span-1 md:col-span-2 row-span-2 min-h-[400px] md:min-h-[500px]",
    medium: "col-span-1 row-span-2 min-h-[350px] md:min-h-[450px]",
    small: "col-span-1 row-span-1 min-h-[250px] md:min-h-[300px]",
  };

  return (
    <div
      className={`group relative overflow-hidden bg-muted ${sizeClasses[size]}`}
    >
      {/* Background Image */}
      {theme.image_url && (
        <div
          className="absolute inset-0 bg-cover bg-center cinematic-hover"
          style={{ backgroundImage: `url(${theme.image_url})` }}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white">
        <h3 className="mb-1 font-serif text-2xl font-light md:text-3xl">
          {theme.title}
        </h3>
        {theme.tagline && (
          <p className="mb-3 text-sm text-white/70">{theme.tagline}</p>
        )}

        {/* Activities preview */}
        {theme.activities && theme.activities.length > 0 && size !== "small" && (
          <ul className="mb-4 space-y-0.5">
            {theme.activities.slice(0, 3).map((activity, i) => (
              <li key={i} className="text-xs text-white/50">
                {activity}
              </li>
            ))}
          </ul>
        )}

        {/* CTAs */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/experiences/${theme.slug}`}
            className="nav-text inline-flex items-center gap-1 border border-white/40 px-4 py-2 text-xs text-white/90 transition-all hover:bg-white hover:text-black"
          >
            Explore Theme <ArrowRight size={12} />
          </Link>
          <Link
            href={`/liv?theme=${theme.slug}`}
            className="nav-text inline-flex items-center gap-1 bg-white/10 px-4 py-2 text-xs text-white/90 backdrop-blur-sm transition-all hover:bg-white hover:text-black"
          >
            Design with AH
          </Link>
        </div>
      </div>
    </div>
  );
}
