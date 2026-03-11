"use client";

import { useState } from "react";
import Link from "next/link";
import type { Storyteller } from "@/lib/supabase/types";

const CATEGORIES = [
  "All",
  "Culture",
  "Art",
  "Culinary",
  "Adventure",
  "Health",
  "Entertainment",
  "Innovation",
];

interface StorytellerFilterProps {
  storytellers: Storyteller[];
}

export function StorytellerFilter({ storytellers }: StorytellerFilterProps) {
  const [active, setActive] = useState("All");

  const filtered =
    active === "All"
      ? storytellers
      : storytellers.filter((st) => st.category === active);

  // Only show filter if any storyteller has a category set
  const hasCategories = storytellers.some((st) => st.category);

  return (
    <>
      {hasCategories && (
        <div className="mb-12 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`cursor-pointer border px-4 py-2 text-sm transition-colors duration-300 ${
                active === cat
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((st) => (
            <Link
              key={st.id}
              href={`/storytellers/${st.slug}`}
              className="group"
            >
              <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-muted">
                {st.portrait_url ? (
                  <div
                    className="h-full w-full bg-cover bg-center cinematic-hover"
                    style={{ backgroundImage: `url(${st.portrait_url})` }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="font-serif text-4xl font-light text-muted-foreground">
                      {st.name[0]}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="font-serif text-xl font-light transition-opacity group-hover:opacity-80">
                {st.name}
              </h3>
              {st.role && (
                <p className="text-sm text-muted-foreground">{st.role}</p>
              )}
              {st.category && (
                <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                  {st.category}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-muted-foreground">
          <p>No storytellers in this category yet.</p>
        </div>
      )}
    </>
  );
}
