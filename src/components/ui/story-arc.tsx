interface StoryArcProps {
  arrival?: string[] | null;
  immersion?: string[] | null;
  climax?: string[] | null;
  reflection?: string[] | null;
}

const phases = [
  { key: "arrival", label: "Arrival", subtitle: "Something meaningful is beginning" },
  { key: "immersion", label: "Immersion", subtitle: "I'm inside this world now" },
  { key: "climax", label: "Climax", subtitle: "I'll never forget this" },
  { key: "reflection", label: "Reflection", subtitle: "I understand what this meant" },
] as const;

export function StoryArc({ arrival, immersion, climax, reflection }: StoryArcProps) {
  const data: Record<string, string[] | null | undefined> = {
    arrival,
    immersion,
    climax,
    reflection,
  };

  const hasContent = Object.values(data).some((v) => v && v.length > 0);
  if (!hasContent) return null;

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
      {phases.map((phase) => {
        const elements = data[phase.key];
        if (!elements || elements.length === 0) return null;

        return (
          <div key={phase.key} className="space-y-3">
            <div>
              <h4 className="font-serif text-xl font-light">{phase.label}</h4>
              <p className="text-xs italic text-muted-foreground">{phase.subtitle}</p>
            </div>
            <ul className="space-y-1.5">
              {elements.map((el, i) => (
                <li key={i} className="text-sm text-muted-foreground">
                  {el}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
